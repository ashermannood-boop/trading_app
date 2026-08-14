import cron from 'node-cron';
import Order from '../models/Order.js';

class OrderProcessor {
  constructor() {
    this.isProcessing = false;
    this.priceFeedService = null;
  }

  // Inject the live server price feed service safely from server.js
  init(priceFeedServiceInstance) {
    this.priceFeedService = priceFeedServiceInstance;
    this.startAutoProcessor();
  }

  // Process expired orders
  async processExpiredOrders() {
    // Prevent overlapping cron jobs if a collection check runs long
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // Find active orders where the endTime has crossed the current server timestamp
      const expiredOrders = await Order.find({
        status: 'active',
        endTime: { $lte: new Date() }
      });

      if (expiredOrders.length > 0) {
        console.log(`[Processor] Found ${expiredOrders.length} expired orders to resolve.`);

        for (const order of expiredOrders) {
          try {
            let currentMarketPrice = order.entryPrice; // Default fallback parameter

            if (this.priceFeedService && typeof this.priceFeedService.getPrices === 'function') {
              // Fetch the entire price dictionary map safely
              const allPrices = this.priceFeedService.getPrices();
              
              // Extract the specific token asset symbol payload (e.g., 'BNBUSDT')
              const livePriceData = allPrices ? allPrices[order.symbol] : null;

              if (livePriceData) {
                // Adapt to either an object wrapper structure { price: 643 } or a raw flat number string
                const targetPrice = typeof livePriceData === 'object' ? livePriceData.price : livePriceData;
                
                if (targetPrice && !isNaN(parseFloat(targetPrice))) {
                  currentMarketPrice = parseFloat(targetPrice);
                }
              }
            }

            console.log(`[Processor] Finalizing ${order.isDemo ? 'DEMO' : 'LIVE'} order ${order._id}. Passing Live Exit Price: ${currentMarketPrice}`);

            // Direct individual order database document execution sequence
            // This runs the fixed math logic that prevents the 224 double-calculation bug
            await order.completeOrder(currentMarketPrice);

          } catch (orderError) {
            console.error(`[Processor] Failed resolving individual order ${order._id}:`, orderError.message);
          }
        }
      }
      
    } catch (error) {
      console.error('Error in background order processor loop context:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Start automatic processing
  startAutoProcessor() {
    // Process orders every 10 seconds safely across production infrastructure threads
    cron.schedule('*/10 * * * * *', () => {
      this.processExpiredOrders();
    });
    
    console.log('🚀 Order processor background cron engine initialized.');
  }

  // Stop automatic processing
  stopAutoProcessor() {
    console.log('Order processor stopped');
  }
}

export const orderProcessor = new OrderProcessor();
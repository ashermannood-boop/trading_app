// controllers/tradeController.js - UPDATED AND CORRECTED VERSION
import Order from "../models/Order.js";
import userModel from "../models/usermodel.js";
import Transaction from "../models/Transaction.js";
//import PriceFeedService from "../services/priceFeed.js";

export const tradeController = {
  placeOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { symbol, symbolName, coinId, direction, amount, leverage = 1, duration, entryPrice, isDemo } = req.body;

      const isDemoMode = isDemo === true || isDemo === 'true';

      const requiredFields = ['symbol', 'direction', 'amount', 'duration'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Calculate required balance - FEES REMOVED
      const requiredBalance = parseFloat(amount);

      const filter = { _id: userId };
      const updatePayload = {
        $inc: { "totalTrades": 1 }
      };

      if (isDemoMode) {
        filter["demoBalance"] = { $gte: requiredBalance };
        updatePayload.$inc["demoBalance"] = -requiredBalance;
      } else {
        filter["wallet.usdt"] = { $gte: requiredBalance };
        updatePayload.$inc["wallet.usdt"] = -requiredBalance;
      }

      const user = await userModel.findOneAndUpdate(
        filter,
        updatePayload,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          message: isDemoMode
            ? "Insufficient Demo Balance. Please top up your demo account by contacting support."
            : "Insufficient balance. Please check your live wallet."
        });
      }

      const activeLeverage = isDemoMode ? 1 : parseInt(leverage);

      const durationRates = {
        30: 12, 50: 12, 60: 18, 90: 20, 120: 22, 180: 25, 240: 28, 365: 30
      };
      const rate = durationRates[duration] || 12;
      const expectedReturn = (parseFloat(amount) * (rate / 100)) * activeLeverage;

      const orderData = {
        user: userId,
        symbol: symbol.toUpperCase(),
        symbolName: symbolName || symbol.replace('USDT', ''),
        coinId: coinId || symbol.toLowerCase(),
        direction: direction.toLowerCase(),
        amount: parseFloat(amount),
        leverage: activeLeverage,
        duration: parseInt(duration),
        entryPrice: parseFloat(entryPrice),
        fee: 0, // Set to 0 permanently
        expectedReturn: expectedReturn,
        status: 'active',
        isDemo: isDemoMode,
        startTime: new Date(),
        endTime: new Date(Date.now() + (parseInt(duration) * 1000))
      };

      const order = new Order(orderData);
      await order.save();

      res.status(201).json({
        success: true,
        message: isDemoMode ? "Demo order placed successfully" : "Order placed successfully",
        data: {
          order: {
            id: order._id,
            symbol: order.symbol,
            direction: order.direction,
            amount: order.amount,
            duration: order.duration,
            entryPrice: order.entryPrice,
            expectedReturn: order.expectedReturn,
            endTime: order.endTime,
            status: order.status,
            isDemo: order.isDemo
          },
          user: {
            balance: isDemoMode ? user.demoBalance : user.wallet.usdt,
            isDemoMode: isDemoMode
          }
        }
      });

    } catch (error) {
      console.error("Place order error:", error);
      res.status(500).json({
        success: false,
        message: "Error placing order",
        error: error.message
      });
    }
  },

  // Get active orders with live data - FIXED VERSION
  getActiveOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, coinId } = req.query;

      const filter = {
        user: userId,
        status: 'active'
      };

      if (coinId) {
        filter.coinId = coinId;
      }

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .lean(),
        Order.countDocuments(filter)
      ]);

      // Add live P&L calculation
      const ordersWithLiveData = await Promise.all(
        orders.map(async (order) => {
          try {
            // First, check if global instance exists
            const priceService = global.priceFeedService;
            const currentPrice = (priceService && priceService.getPrice)
              ? priceService.getPrice(order.coinId)
              : order.entryPrice;

            // If getPrice returns an object with usd property
            let actualPrice = currentPrice;
            if (currentPrice && typeof currentPrice === 'object' && currentPrice.usd) {
              actualPrice = currentPrice.usd;
            }

            let livePnl = 0;
            let livePercentage = 0;

            // Get user to check forceWin status
            const user = await userModel.findById(order.user).select('forceWin');
            const userForceWin = user ? user.forceWin : false;

            if (userForceWin) {
              // If forceWin is true, show positive P&L
              const rate = order.expectedReturn / order.amount * 100;
              livePercentage = Math.abs(rate) || 0;
              livePnl = order.expectedReturn || 0;
            } else {
              // Normal calculation
              if (order.direction === 'buy') {
                const priceChange = ((actualPrice - order.entryPrice) / order.entryPrice) * 100;
                livePercentage = priceChange * order.leverage;
                livePnl = (order.amount * livePercentage) / 100;
              } else {
                const priceChange = ((order.entryPrice - actualPrice) / order.entryPrice) * 100;
                livePercentage = priceChange * order.leverage;
                livePnl = (order.amount * livePercentage) / 100;
              }
            }

            const timeLeft = order.endTime ? Math.max(0, Math.ceil((new Date(order.endTime) - new Date()) / 1000)) : 0;
            let progress = 0;

            if (order.startTime && order.endTime) {
              const totalDuration = new Date(order.endTime) - new Date(order.startTime);
              const elapsed = new Date() - new Date(order.startTime);
              progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            }

            return {
              ...order,
              currentPrice: actualPrice,
              livePnl: parseFloat(livePnl.toFixed(2)),
              livePercentage: parseFloat(livePercentage.toFixed(2)),
              timeLeft,
              progress: parseFloat(progress.toFixed(1)),
              userForceWin
            };
          } catch (error) {
            console.error(`Error processing order ${order._id}:`, error);
            return {
              ...order,
              currentPrice: order.entryPrice,
              livePnl: 0,
              livePercentage: 0,
              timeLeft: 0,
              progress: 100,
              userForceWin: false,
              error: 'Failed to calculate live data'
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          orders: ordersWithLiveData,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error("Get active orders error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching active orders",
        error: error.message
      });
    }
  },

  // Get completed orders - FIXED VERSION
  getCompletedOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        coinId,
        startDate,
        endDate,
        result
      } = req.query;

      const filter = {
        user: userId,
        status: 'completed'
      };

      if (coinId) {
        filter.coinId = coinId;
      }

      if (result && ['win', 'loss', 'break_even'].includes(result)) {
        filter.result = result;
      }

      if (startDate || endDate) {
        filter.completedAt = {};
        if (startDate) {
          filter.completedAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          filter.completedAt.$lte = endDateObj;
        }
      }

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ completedAt: -1 })
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .lean(),
        Order.countDocuments(filter)
      ]);

      // Format dates and numbers
      const formattedOrders = orders.map(order => ({
        ...order,
        profit: order.profit ? parseFloat(order.profit.toFixed(2)) : 0,
        profitPercentage: order.profitPercentage ? parseFloat(order.profitPercentage.toFixed(2)) : 0,
        amount: order.amount ? parseFloat(order.amount.toFixed(2)) : 0,
        entryPrice: order.entryPrice ? parseFloat(order.entryPrice.toFixed(8)) : 0,
        exitPrice: order.exitPrice ? parseFloat(order.exitPrice.toFixed(8)) : 0,
        actualPayout: order.actualPayout ? parseFloat(order.actualPayout.toFixed(2)) : 0,
        formattedDate: order.completedAt ? new Date(order.completedAt).toLocaleString() : ''
      }));

      res.json({
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error("Get completed orders error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching completed orders",
        error: error.message
      });
    }
  },

  // Get order by ID - FIXED VERSION
  getOrderById: async (req, res) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        user: userId
      }).lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Get current price for active orders
      let currentPrice = order.entryPrice;
      if (order.status === 'active') {
        const priceService = global.priceFeedService;
        const fetchedPrice = (priceService && priceService.getPrice)
          ? priceService.getPrice(order.coinId)
          : order.entryPrice;

        currentPrice = fetchedPrice;
        if (fetchedPrice && typeof fetchedPrice === 'object' && fetchedPrice.usd) {
          currentPrice = fetchedPrice.usd;
        }
      }

      const formattedOrder = {
        ...order,
        currentPrice,
        profit: order.profit ? parseFloat(order.profit.toFixed(2)) : 0,
        profitPercentage: order.profitPercentage ? parseFloat(order.profitPercentage.toFixed(2)) : 0,
        amount: order.amount ? parseFloat(order.amount.toFixed(2)) : 0,
        entryPrice: order.entryPrice ? parseFloat(order.entryPrice.toFixed(8)) : 0,
        exitPrice: order.exitPrice ? parseFloat(order.exitPrice.toFixed(8)) : 0,
        actualPayout: order.actualPayout ? parseFloat(order.actualPayout.toFixed(2)) : 0,
        timeLeft: order.timeLeft || 0,
        progress: order.progress || 0
      };

      res.json({
        success: true,
        data: formattedOrder
      });

    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching order",
        error: error.message
      });
    }
  },

  // Cancel order with refund - FIXED VERSION
  cancelOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { reason } = req.body || {};

      // Find active order
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
        status: 'active'
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Active order not found or already completed/cancelled"
        });
      }

      // Check if order can be cancelled (minimum 5 seconds remaining)
      const now = new Date();
      const timeRemaining = Math.ceil((order.endTime - now) / 1000);

      if (timeRemaining < 5) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel order with less than 5 seconds remaining",
          timeRemaining
        });
      }

      // Get user and refund balance (amount + fee)
      const user = await userModel.findById(userId);
      const refundAmount = order.amount + order.fee;
      user.wallet.usdt += refundAmount;

      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = now;
      order.cancellationReason = reason || 'User cancelled';
      order.isLive = false;
      order.completedAt = now;

      // Save all changes
      await Promise.all([
        user.save(),
        order.save()
      ]);

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: {
          orderId: order._id,
          refundAmount: refundAmount,
          newBalance: user.wallet.usdt,
          cancellationReason: order.cancellationReason,
          cancelledAt: order.cancelledAt
        }
      });

    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Error cancelling order",
        error: error.message
      });
    }
  },

  // Admin: Toggle force win for user
  toggleForceWin: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const { userId } = req.params;
      const { forceWin } = req.body;

      if (typeof forceWin !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "forceWin must be a boolean value"
        });
      }

      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      user.forceWin = forceWin;
      await user.save();

      res.json({
        success: true,
        message: `Force win ${forceWin ? 'enabled' : 'disabled'} for user`,
        data: {
          userId: user._id,
          email: user.email,
          username: user.username,
          forceWin: user.forceWin,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error("Toggle force win error:", error);
      res.status(500).json({
        success: false,
        message: "Error toggling force win",
        error: error.message
      });
    }
  },

  // Admin: Process expired orders manually
  processExpiredOrders: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const results = await Order.processExpiredOrders();

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      res.json({
        success: true,
        message: `Processed ${successful.length} orders successfully, ${failed.length} failed`,
        data: {
          processed: successful,
          failed: failed,
          summary: {
            totalOrders: results.length,
            successful: successful.length,
            failed: failed.length,
            totalProfit: successful.reduce((sum, order) => sum + (order.profit || 0), 0),
            forceWinOrders: successful.filter(o => o.wasForceWin).length,
            randomLossOrders: successful.filter(o => o.wasRandomLose).length
          }
        }
      });

    } catch (error) {
      console.error("Process expired orders error:", error);
      res.status(500).json({
        success: false,
        message: "Error processing expired orders",
        error: error.message
      });
    }
  },

  // User: Get current balance
  getBalance: async (req, res) => {
    try {
      const userId = req.user.id;

      console.log('Fetching balance for user:', userId);

      const [user] = await Promise.all([
        userModel.findById(userId).select('wallet forceWin totalTrades totalProfit totalLoss demoBalance'),
      ]);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.json({
        success: true,
        data: {
          wallet: {
            usdt: user.wallet.usdt,
            btc: user.wallet.btc || 0,
            eth: user.wallet.eth || 0,
            loanUsdt: user.wallet.loanUsdt || 0
          },
          demoBalance: user.demoBalance || 0,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error("Get balance error:", error);
      res.status(400).json({
        success: false,
        message: "Error fetching balance",
        error: error.message
      });
    }
  },

  // Get order history with filters - NEW METHOD
  getOrderHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 50,
        status,
        result,
        symbol,
        startDate,
        endDate,
        sortBy = '-createdAt'
      } = req.query;

      const filter = { user: userId };

      if (status && ['active', 'completed', 'cancelled', 'expired'].includes(status)) {
        filter.status = status;
      }

      if (result && ['win', 'loss', 'break_even'].includes(result)) {
        filter.result = result;
      }

      if (symbol) {
        filter.symbol = { $regex: symbol, $options: 'i' };
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = endDateObj;
        }
      }

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort(sortBy)
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .lean(),
        Order.countDocuments(filter)
      ]);

      const formattedOrders = orders.map(order => ({
        ...order,
        profit: order.profit ? parseFloat(order.profit.toFixed(2)) : 0,
        profitPercentage: order.profitPercentage ? parseFloat(order.profitPercentage.toFixed(2)) : 0,
        amount: order.amount ? parseFloat(order.amount.toFixed(2)) : 0,
        formattedDate: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
        durationLabel: order.duration ? `${order.duration}s` : ''
      }));

      res.json({
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          },
          filters: {
            status,
            result,
            symbol,
            startDate,
            endDate
          }
        }
      });

    } catch (error) {
      console.error("Get order history error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching order history",
        error: error.message
      });
    }
  },

  // Get All Orders (With optional filtering by status and pagination)
  getAllOrdersAdmin: async (req, res) => {
    try {
      const { status, page = 1, limit = 50, isDemo } = req.query;

      // Build dynamic query filter
      const queryFilter = {};
      if (status) queryFilter.status = status;
      if (isDemo !== undefined) queryFilter.isDemo = isDemo === 'true';

      // Calculate pagination parameters
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Fetch orders and total count for frontend pagination metrics
      const [orders, totalOrders] = await Promise.all([
        Order.find(queryFilter)
          .sort({ createdAt: -1 }) // Newest trades first
          .skip(skip)
          .limit(parseInt(limit))
          // FIXED: Passing userModel class directly to prevent MissingSchemaError
          .populate({ path: 'user', select: 'username email wallet demoBalance', model: userModel }),
        Order.countDocuments(queryFilter)
      ]);

      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            total: totalOrders,
            page: parseInt(page),
            pages: Math.ceil(totalOrders / parseInt(limit)),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error("Admin Get All Orders Error:", error);
      res.json({
        success: false,
        message: "Error fetching system orders",
        error: error.message
      });
    }
  },

  // Delete Completed Orders Only
  deleteCompletedOrdersAdmin: async (req, res) => {
    try {
      const { orderId } = req.body;

      const deleteFilter = { status: 'completed' };

      if (orderId) {
        deleteFilter._id = orderId;
      }

      const deletionReport = await Order.deleteMany(deleteFilter);

      if (deletionReport.deletedCount === 0) {
        return res.status(444).json({
          success: false,
          message: orderId
            ? "Target order not found or is not marked as completed."
            : "No completed orders found to clear."
        });
      }

      res.status(200).json({
        success: true,
        message: orderId
          ? "Completed order deleted successfully."
          : `Successfully purged ${deletionReport.deletedCount} completed orders from the cluster.`,
        deletedCount: deletionReport.deletedCount
      });

    } catch (error) {
      console.error("Admin Order Deletion Error:", error);
      res.status(500).json({
        success: false,
        message: "Error clearing completed orders from database",
        error: error.message
      });
    }
  }
};
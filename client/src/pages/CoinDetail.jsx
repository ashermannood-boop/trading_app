import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { usePriceFeed } from "../context/PriceFeedContext";
import { useOrders } from "../context/OrdersContext";
import OrderModal from "../components/OrderModal";
import OrdersDisplay from "../components/OrdersDisplay";
import MobileNav from '../components/MobileNav';
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Smartphone,
  Monitor,
  AlertTriangle
} from "lucide-react";
import { tradeAPI, conversionAPI } from "../services/api";

const symbol = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL", binancecoin: "BNB",
  ripple: "XRP", cardano: "ADA", dogecoin: "DOGE", polkadot: "DOT",
  usdc: "USDC", tether: "USDT", tron: "TRX", chainlink: "LINK",
  polygon: "MATIC", avalanche: "AVAX", near: "NEAR", uniswap: "UNI",
  aptos: "APT", sui: "SUI", optimism: "OP", arbitrum: "ARB",
  stellar: "XLM", cosmos: "ATOM", stacks: "STX", fantom: "FTM",
  celestia: "TIA", "fetch-ai": "FET", "lido-dao": "LDO",
  thorchain: "RUNE", pancakeswap: "CAKE", aave: "AAVE",
  "internet-computer": "ICP", filecoin: "FIL", "hedera-hashgraph": "HBAR",
  vechain: "VET", algorand: "ALGO", pepe: "PEPE", "shiba-inu": "SHIB",
  dogwifhat: "WIF", litecoin: "LTC", "bitcoin-cash": "BCH",
  "ethereum-classic": "ETC",
};

const CoinDetail = () => {
  const { id } = useParams();
  const { prices } = usePriceFeed();
  const { activeOrders, placeOrder } = useOrders();
  const navigate = useNavigate();
  const { orderLoading, setOrderLoading, isDemoMode, setIsDemoMode, demoBalance, setDemoBalance } = useAuth();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [direction, setDirection] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const coinData = prices[id];
  const [loading, setLoading] = useState(false);
  const [marketPrices, setMarketPrices] = useState({});

  // Account Mode State
  //  const [isDemoMode, setIsDemoMode] = useState(false);
  const [realBalance, setRealBalance] = useState({ btc: 0, eth: 0, usdt: 0 });
  // const [demoBalance, setDemoBalance] = useState({ btc: 1, eth: 10, usdt: 10000 }); // Mock initial demo funds

  useEffect(() => {
    fetchUserBalance();
    getMarketPrices();
  }, [showOrderModal]);

  const fetchUserBalance = async () => {
    try {
      setLoading(true);
      const result = await tradeAPI.getUserBalance();
      console.warn("Fetched user balance:", result);
      setLoading(false);

      if (result.success) {
        setRealBalance({
          btc: result.data.wallet.btc,
          eth: result.data.wallet.eth,
          usdt: result.data.wallet.usdt,
        });

        setDemoBalance({
          btc:0,
          eth: 0, 
          usdt: result.data.demoBalance,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch real balance');
    }
  };

  const getMarketPrices = async () => {
    try {
      const response = await conversionAPI.getPrices();
      setMarketPrices(response.data);
    } catch (error) {
      console.error('Error getting prices:', error);
    }
  };

  const isAuthenticated = localStorage.getItem('token') ? true : false;

  // Determine active balance context based on toggle selection
  const activeBalance = isDemoMode ? demoBalance : realBalance;

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOrderConfirm = async (orderData) => {
    try {
      const enhancedData = {
        ...orderData,
        coinId: id,
        symbol: `${symbol[id]}USDT`,
        symbolName: symbol[id],
        entryPrice: coinData?.usd || 0,
        isDemo: isDemoMode // Alert your backend architecture whether this transaction belongs to paper/demo systems
      };

      // Demo Mode frontend emulation logic or actual real trade execution API pathing
      let response = null;

      if (isDemoMode) {
        // Handle local Demo deduction logic if no dedicated backend endpoint exists
        if (demoBalance.usdt < orderData.amount) {
          throw new Error("Insufficient Demo Balance");
        }
        setDemoBalance(prev => ({ ...prev, usdt: prev.usdt - orderData.amount }));
        response = await tradeAPI.placeOrder(enhancedData);



        console.log("Demo order response (no real order placed):", response);

      } else {
        response = await tradeAPI.placeOrder(enhancedData);
      }

      //   console.warn({ response })

      toast(response.success ? (
        <div className="flex items-center gap-3 text-black">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${direction === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
            {direction === 'buy' ?
              <TrendingUp className="w-5 h-5 text-green-600" /> :
              <TrendingDown className="w-5 h-5 text-red-600" />
            }
          </div>
          <div>
            {/* Forces text to remain explicitly dark for a white container background */}
            <div className="font-bold text-gray-900">
              Order Placed {isDemoMode && <span className="text-xs text-amber-600 font-bold ml-1">(DEMO)</span>}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {direction === 'buy' ? 'Buy' : 'Sell'} {orderData.duration}s • ${orderData.amount}
            </div>
          </div>
        </div>
      ) : (
        <div className="font-bold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 inline-block mr-2 flex-shrink-0" />
          <span>{response.message || 'Failed to place order'}</span>
        </div>
      ),
        {
          position: isMobile ? "bottom-center" : "top-right",
          autoClose: 3000,
        }
      );

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
      setShowOrderModal(false);
    }
  };

  const activeCoinOrders = activeOrders.filter(order => order.coinId === id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Dynamic Order Modal Passing Down Active Environment Settings */}
      <OrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        symbol={`${symbol[id]}USDT`}
        price={coinData?.usd}
        direction={direction}
        onConfirm={handleOrderConfirm}
        isMobile={isMobile}
        userBalance={activeBalance}
        availableAmount={activeBalance.usdt}
        isAuthenticated={isAuthenticated}
        marketPrices={marketPrices}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base font-medium hidden sm:inline">Back</span>
            </button>

            {/* Slick Animated Account Environment Switcher */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex relative items-center select-none w-44 sm:w-48 shadow-inner">
              <button
                className={`flex-1 text-center py-1.5 text-xs sm:text-sm font-semibold z-10 transition-colors duration-200 ${!isDemoMode ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setIsDemoMode(false)}
              >
                Real
              </button>
              <button
                className={`flex-1 text-center py-1.5 text-xs sm:text-sm font-semibold z-10 transition-colors duration-200 ${isDemoMode ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setIsDemoMode(true)}
              >
                Demo
              </button>

              {/* Framer Motion Sliding Pill Background */}
              <motion.div
                className={`absolute top-1 bottom-1 left-1 rounded-lg shadow-sm ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`}
                animate={{
                  x: isDemoMode ? '96%' : '0%',
                  width: '50%'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              />
            </div>

            <div className="flex items-center gap-3">
              <img
                src={assets[id]}
                alt={symbol[id]}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
              />
              <div className="text-right">
                <div className="font-bold text-base sm:text-lg">{symbol[id]}/USDT</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {activeCoinOrders.length} active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Price & Actions */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    Current Price
                    {isDemoMode && <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Demo</span>}
                  </div>
                  <div className="text-xl sm:text-xl lg:text-2xl font-bold mt-1">
                    ${coinData?.usd?.toLocaleString()}
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full ${coinData?.usd_24h_change >= 0 ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                  {coinData?.usd_24h_change >= 0 ?
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> :
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                  <span className="text-sm sm:text-base font-medium">
                    {coinData?.usd_24h_change >= 0 ? "+" : ""}
                    {coinData?.usd_24h_change?.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Balance Readout helper for transparency */}
              <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs sm:text-sm flex justify-between items-center border border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Available Wallet Capital:</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                  ${activeBalance.usdt?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setDirection('buy');
                    setShowOrderModal(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Buy</span>
                </button>
                <button
                  onClick={() => {
                    setDirection('sell');
                    setShowOrderModal(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>Sell</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm h-full overflow-hidden"
            >
              <div className="h-90 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
                <iframe
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol[id]}USDT&interval=1&theme=dark&style=1&locale=en&hidesidetoolbar=1&hide_top_toolbar=1&hide_legend=1&hide_volume=1&allow_symbol_change=0&save_image=0&withdateranges=0&details=0&calendar=0`}
                  width="100%"
                  height="100%"
                  className="border-0"
                  title={`${symbol[id]} Chart`}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Orders Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 sm:mt-8 mb-20 sm:mb-8"
        >
          <OrdersDisplay isMobile={isMobile} />
        </motion.div>
      </main>

      {/* <MobileNav /> */}
    </div>
  );
};

export default CoinDetail;
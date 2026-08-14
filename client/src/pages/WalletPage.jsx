import { useState, useEffect } from "react";
import {
  Eye, EyeOff, ChevronLeft,
  ArrowDownCircle, ArrowUpCircle,
  BadgeDollarSign, Clock4,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { assets } from "../assets/assets";
import MobileNav from "../components/MobileNav";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

export default function WalletPage() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);
  const { backendUrl, token } = useAuth();
  const [walletData, setWalletData] = useState({
    usdt: 0,
    btc: 0,
    eth: 0,
    loanUsdt: 0.00
  });
  const [loading, setLoading] = useState(false);
  const [marketPrices, setMarketPrices] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getMarketPrices = async () => {
    try {
      setPriceLoading(true);
      const response = await axios.get(`${backendUrl}api/conversions/prices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMarketPrices(response.data.data);
        setLastUpdated(response.data.timestamp);
      } else {
        toast.error(response.data.message || "Failed to fetch market prices");
      }
    } catch (error) {
      console.error('Error getting prices:', error);
      toast.error("Failed to fetch market prices");
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setWalletData(res.data.user.wallet);
      } else {
        toast.error('Failed to fetch wallet data');
      }
    } catch (error) {
      toast.error("Wallet fetch failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    getMarketPrices();

    // Refresh prices every 30 seconds
    const intervalId = setInterval(() => {
      getMarketPrices();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Calculate total balance with market prices
  const calculateTotalBalance = () => {
    const usdtValue = walletData.usdt || 0;

    // Use market prices if available, otherwise use default values
    const btcPrice = marketPrices?.BTC?.price || 0;
    const btcValue = (walletData.btc || 0) * btcPrice;

    const ethPrice = marketPrices?.ETH?.price || 0;
    const ethValue = (walletData.eth || 0) * ethPrice;

    const loanUsdtValue = walletData.loanUsdt || 0;

    return usdtValue + btcValue + ethValue + loanUsdtValue;
  };

  // Calculate 24h change for total balance
  const calculateTotalChange = () => {
    const btcChange = marketPrices?.BTC?.change24h || 0;
    const ethChange = marketPrices?.ETH?.change24h || 0;
    const usdtChange = 0; // USDT is stablecoin, usually 0 change

    // Calculate weighted average change based on portfolio composition
    const totalBalance = calculateTotalBalance();
    if (totalBalance === 0) return 0;

    const btcBalance = (walletData.btc || 0) * (marketPrices?.BTC?.price || 0);
    const ethBalance = (walletData.eth || 0) * (marketPrices?.ETH?.price || 0);
    const usdtBalance = walletData.usdt || 0;

    const weightedChange = (
      (btcBalance * btcChange) +
      (ethBalance * ethChange) +
      (usdtBalance * usdtChange)
    ) / totalBalance;

    return weightedChange;
  };

  const totalBalance = calculateTotalBalance();
  const totalChange = calculateTotalChange();
  const totalChangeAmount = (totalBalance * totalChange) / 100;

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInSeconds = Math.floor((now - updated) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const quickActions = [
    { icon: <ArrowDownCircle size={20} />, label: "Deposit", color: "text-blue-400", route: "/deposit" },
    { icon: <ArrowUpCircle size={20} />, label: "Withdraw", color: "text-green-400", route: "/withdraw" },
    //{ icon: <BadgeDollarSign size={20} />, label: "Loan", color: "text-purple-400", route: "/loan" },
    { icon: <Clock4 size={20} />, label: "History", color: "text-gray-400", route: "/history" }
  ];

  return (
    loading ? (
      <Loading text="Loading your wallet..." />
    ) : (
      <div className="min-h-screen bg-gray-900 text-gray-100 mb-20">
        <MobileNav />

        {/* Header */}
        <div className="hidden sm:block bg-gray-900 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-lg font-semibold text-white">My Wallet</h1>
              <div className="w-20"></div> {/* Spacer for alignment */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-2 py-6">
          <div className="space-y-6">

            {/* Balance Overview */}
            <div className="bg-gray-900 rounded-lg sm:border border-gray-700 p-3 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-md font-bold text-white">Wallet Balance</h2>
                  {marketPrices && lastUpdated && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-gray-400 text-xs">Live • Updated {formatTimeAgo(lastUpdated)}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {priceLoading && (
                    <span className="text-xs text-gray-400">Refreshing...</span>
                  )}
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-300"
                  >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{showBalance ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              {/* Total Balance */}
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  {marketPrices && (
                    <button
                      onClick={getMarketPrices}
                      disabled={priceLoading}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                      title="Refresh prices"
                    >
                      <RefreshCw size={12} className={priceLoading ? "animate-spin" : ""} />
                      {priceLoading ? "Refreshing..." : "Refresh"}
                    </button>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">
                      {showBalance ? `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                    </p>
                    <div className="flex items-center gap-2">
                      {showBalance && marketPrices && totalChange !== 0 && (
                        <>
                          <span className={`text-sm font-medium ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                          </span>
                          <span className={`text-sm ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalChange >= 0 ? '+' : ''}${Math.abs(totalChangeAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-gray-500 text-sm">
                            (24h)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* <BalanceCard
                  label="Available"
                  value={walletData.usdt}
                  showBalance={showBalance}
                  color="text-green-400"
                />
                <BalanceCard
                  label="Crypto"
                  value={calculateTotalBalance() - walletData.usdt - walletData.loanUsdt}
                  showBalance={showBalance}
                  color="text-blue-400"
                /> */}
                {/* <BalanceCard
                  label="Loans"
                  value={walletData.loanUsdt}
                  showBalance={showBalance}
                  color="text-purple-400"
                /> */}
              </div>

              {/* Wallet Assets */}
              <div className="pt-6 border-t border-gray-700">
                <h3 className="font-semibold text-white mb-4">Wallet Assets</h3>
                <div className="space-y-3">
                  <AssetRow
                    currency="USDT"
                    balance={walletData.usdt}
                    showBalance={showBalance}
                    logo={assets.tether}
                    usdValue={walletData.usdt}
                    price={1}
                    change={0}
                    marketPrices={marketPrices}
                  />
                  <AssetRow
                    currency="BTC"
                    balance={walletData.btc}
                    showBalance={showBalance}
                    logo={assets.bitcoin}
                    usdValue={walletData.btc * (marketPrices?.BTC?.price || 0)}
                    price={marketPrices?.BTC?.price || 0}
                    change={marketPrices?.BTC?.change24h || 0}
                    marketPrices={marketPrices}
                  />
                  <AssetRow
                    currency="ETH"
                    balance={walletData.eth}
                    showBalance={showBalance}
                    logo={assets.ethereum}
                    usdValue={walletData.eth * (marketPrices?.ETH?.price || 0)}
                    price={marketPrices?.ETH?.price || 0}
                    change={marketPrices?.ETH?.change24h || 0}
                    marketPrices={marketPrices}
                  />

                  {/* Loan Assets Section */}
                  {/* <div className="mt-6 pt-4 border-t border-gray-700">
                    <h3 className="font-semibold text-white mb-4">Loan Assets</h3>
                    <AssetRow
                      currency="USDT Loan"
                      balance={walletData.loanUsdt}
                      showBalance={showBalance}
                      logo={assets.tether}
                      usdValue={walletData.loanUsdt}
                      price={1}
                      change={0}
                      marketPrices={marketPrices}
                      isLoan={true}
                    />
                  </div> */}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-lg sm:border border-gray-700 p-3 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <ActionCard
                    onClick={() => navigate(action.route)}
                    key={index}
                    icon={action.icon}
                    label={action.label}
                    color={action.color}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  );
}

// Component for balance cards
function BalanceCard({ label, value, showBalance, color }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 text-center">
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <div className={`font-semibold text-md ${color}`}>
        {showBalance ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••"}
      </div>
    </div>
  );
}

// Component for asset rows with market data
function AssetRow({ currency, balance, showBalance, logo, usdValue, price, change, marketPrices, isLoan = false }) {
  const isStablecoin = currency.includes("USDT");

  return (
    <div className={`flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors border ${isLoan ? "border-purple-500/30" : "border-transparent hover:border-gray-600"}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={logo}
            alt={currency}
            className="w-8 h-8 rounded-full"
          />
          {isLoan && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
              <BadgeDollarSign size={10} className="text-white" />
            </div>
          )}
        </div>
        <div>
          <div className="font-medium text-white">{currency}</div>
          <div className="text-gray-400 text-sm">
            {showBalance ? `${parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${currency.split(' ')[0]}` : "••••"}
          </div>
          {showBalance && marketPrices && !isStablecoin && price > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change?.toFixed(2)}%
              </span>
              <span className="text-gray-500 text-xs">(24h)</span>
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-white mb-1">
          {showBalance ? `$${parseFloat(usdValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
        </div>
        {showBalance && marketPrices && !isStablecoin && (
          <div className="text-xs text-gray-400">
            {parseFloat(balance).toFixed(6)} {currency.split(' ')[0]}
          </div>
        )}
      </div>
    </div>
  );
}

// Component for action cards
function ActionCard({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-4 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors group"
    >
      <div className={`mb-2 ${color}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </button>
  );
}
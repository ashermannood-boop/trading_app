import React, { useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  History,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomeBalanceCard({
  walletData = { usdt: 0, btc: 0, eth: 0, loanUsdt: 0 },
  marketPrices = null,
  priceLoading = false,
  onRefreshPrices = () => {},
  onOpenConvert = () => {},
}) {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  // Calculate total balance
  const totalBalance = useMemo(() => {
    const usdtVal = walletData.usdt || 0;
    const btcVal = (walletData.btc || 0) * (marketPrices?.BTC?.price || 0);
    const ethVal = (walletData.eth || 0) * (marketPrices?.ETH?.price || 0);
    const loanVal = walletData.loanUsdt || 0;

    return usdtVal + btcVal + ethVal + loanVal;
  }, [walletData, marketPrices]);

  // Calculate 24h weighted average change
  const totalChange = useMemo(() => {
    if (!totalBalance || totalBalance === 0) return 0;
    const btcChange = marketPrices?.BTC?.change24h || 0;
    const ethChange = marketPrices?.ETH?.change24h || 0;
    const btcVal = (walletData.btc || 0) * (marketPrices?.BTC?.price || 0);
    const ethVal = (walletData.eth || 0) * (marketPrices?.ETH?.price || 0);

    return (btcVal * btcChange + ethVal * ethChange) / totalBalance;
  }, [totalBalance, walletData, marketPrices]);

  const isPositive = totalChange >= 0;

  return (
    <div className="w-full relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/40 via-dark-900/30 to-dark-900/40 border border-blue-500/20 p-6 backdrop-blur-xl shadow-2xl">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

      {/* Top Bar: Title & Live Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles size={16} />
          </div> */}
          <span className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
            Net Portfolio
          </span>
          {marketPrices && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {marketPrices && (
            <button
              onClick={onRefreshPrices}
              disabled={priceLoading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={priceLoading ? "animate-spin text-blue-400" : ""} />
            </button>
          )}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 transition-colors"
          >
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Center: Main Balance */}
      <div className="mb-6">
        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          {showBalance
            ? `$${totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "••••••••"}
        </div>

        {showBalance && marketPrices && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? "+" : ""}
              {totalChange.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-400">(24h Market)</span>
          </div>
        )}
      </div>

      {/* Bottom Actions Row */}
      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
        <button
          onClick={() => navigate("/deposit")}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <ArrowDownLeft size={16} />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => navigate("/withdraw")}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-200 font-medium text-xs transition-all border border-gray-700/80 active:scale-95"
        >
          <ArrowUpRight size={16} />
          <span>Withdraw</span>
        </button>

        <button
          onClick={onOpenConvert}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-white font-medium text-xs transition-all border border-purple-500/20 active:scale-95"
        >
          <Repeat size={16} />
          <span>Swap</span>
        </button>

        <button
          onClick={() => navigate("/history")}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 font-medium text-xs transition-all border border-gray-700/80 active:scale-95"
        >
          <History size={16} />
          <span>History</span>
        </button>
      </div>
    </div>
  );
}
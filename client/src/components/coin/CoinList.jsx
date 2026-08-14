import React from 'react';
import CoinCard from "./CoinCard";
import { ClipLoader } from "react-spinners";
import { usePriceFeed } from "../../context/PriceFeedContext"
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { LayoutGrid, TrendingUp } from "lucide-react";

// The whitelist of IDs as they appear in your PriceFeedContext
const SELECTED_COINS = [
  "bitcoin", 
  "ethereum", 
  "solana", 
  "binancecoin", 
  "dogecoin", 
  "cardano", 
  "ripple", 
  "polkadot"
];

// Helper to map IDs to USDT symbols for the UI
const symbolMap = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL", binancecoin: "BNB",
  dogecoin: "DOGE", cardano: "ADA", ripple: "XRP", polkadot: "DOT"
};

export default function CoinList() {
  const { prices } = usePriceFeed();
  const navigate = useNavigate();

  // Skeleton placeholders
  const mok = [1, 2, 3, 4, 5, 6, 7, 8];

  // 1. LOADING / EMPTY STATE
  if (!prices || Object.keys(prices).length === 0) {
    return (
      <div className="bg-[#030712] min-h-screen p-4">
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tighter uppercase">
                Market Pulse
            </h2>
            <div className="flex justify-center items-center gap-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Connecting to Feed</span>
            </div>
            
            <div className="space-y-3 opacity-50">
                {mok.map((item) => (
                    <CoinCard
                        key={item}
                        name="Loading..."
                        symbol="---"
                        price={0}
                        change={0}
                    />
                ))}
            </div>
        </div>
      </div>
    );
  }

  // 2. FILTERED DATA LOGIC
  // We filter the prices object entries to only include keys found in SELECTED_COINS
  const filteredPrices = Object.entries(prices).filter(([id]) => 
    SELECTED_COINS.includes(id)
  );

  return (
    <div id='pd' className="bg-[#03071200] min-h-screen p-4 pb-24 ">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="py-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Top Movers</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                Featured Assets
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Real-time valuation from global exchanges</p>
        </div>

        {/* Coin Grid/List */}
        <div className="space-y-1">
          {filteredPrices.map(([id, info]) => (
            <CoinCard
              onClick={() => navigate(`/coin/${id}`)}
              key={id}
              name={id}
              symbol={symbolMap[id] || id.toUpperCase()}
              price={info.usd}
              change={info.usd_24h_change}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate('/markets')}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <LayoutGrid className="w-5 h-5 text-blue-500 group-hover:rotate-90 transition-transform duration-500" />
            <span>Explore All Markets</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-slate-500" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
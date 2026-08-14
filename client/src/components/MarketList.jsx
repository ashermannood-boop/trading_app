import React, { useState, useEffect, useMemo } from 'react';
import MarketCard from './MarketCard';
import { useNavigate } from 'react-router-dom';
import { usePriceFeed } from '../context/PriceFeedContext';
import {
    BarChart3,
    Bitcoin,
    Gem,
    CircleDollarSign,
    Search,
    Lock,
    TrendingUp,
    LayoutGrid
} from 'lucide-react';

const marketDataConfig = {
    stocks: { title: "Global Equities", color: "indigo", data: [] },
    crypto: {
        title: "Digital Assets",
        color: "orange",
        data: [
            { name: "bitcoin", symbol: "BTC" }, { name: "ethereum", symbol: "ETH" },
            { name: "solana", symbol: "SOL" }, { name: "binancecoin", symbol: "BNB" },
            { name: "ripple", symbol: "XRP" }, { name: "cardano", symbol: "ADA" },
            { name: "dogecoin", symbol: "DOGE" }, { name: "polkadot", symbol: "DOT" },
            { name: "tron", symbol: "TRX" }, { name: "chainlink", symbol: "LINK" },
            { name: "polygon", symbol: "MATIC" }, { name: "avalanche", symbol: "AVAX" },
            { name: "shiba-inu", symbol: "SHIB" }, { name: "pepe", symbol: "PEPE" },
            { name: "near", symbol: "NEAR" }, { name: "uniswap", symbol: "UNI" },
            { name: "aptos", symbol: "APT" }, { name: "sui", symbol: "SUI" },
            { name: "optimism", symbol: "OP" }, { name: "arbitrum", symbol: "ARB" },
            { name: "stellar", symbol: "XLM" }, { name: "cosmos", symbol: "ATOM" },
            { name: "stacks", symbol: "STX" }, { name: "fetch-ai", symbol: "FET" },
            { name: "pancakeswap", symbol: "CAKE" }, { name: "lido-dao", symbol: "LDO" },
            { name: "thorchain", symbol: "RUNE" }, { name: "internet-computer", symbol: "ICP" },
            { name: "filecoin", symbol: "FIL" }, { name: "hedera-hashgraph", symbol: "HBAR" },
            { name: "vechain", symbol: "VET" }, { name: "litecoin", symbol: "LTC" },
            { name: "bitcoin-cash", symbol: "BCH" }, { name: "ethereum-classic", symbol: "ETC" },
            { name: "dogwifhat", symbol: "WIF" }
        ]
    },
    metals: { title: "Commodities", color: "cyan", data: [] },
    forex: { title: "Currencies", color: "emerald", data: [] },
};

const categories = [
    { id: 'crypto', label: 'Crypto', icon: Bitcoin },
    { id: 'stocks', label: 'Stocks', icon: BarChart3 },
    { id: 'metals', label: 'Metals', icon: Gem },
    { id: 'forex', label: 'Forex', icon: CircleDollarSign },
];

const MarketList = () => {
    const [activeCategory, setActiveCategory] = useState('crypto');
    const [searchTerm, setSearchTerm] = useState('');
    const { prices } = usePriceFeed();
    const navigate = useNavigate();

    const filteredData = useMemo(() => {
        let baseData = [...(marketDataConfig[activeCategory]?.data || [])];

        if (activeCategory === 'crypto' && prices) {
            baseData = baseData.map(asset => {
                const live = prices[asset.name];
                return {
                    ...asset,
                    price: live?.usd || 0,
                    change: live?.usd_24h_change || 0
                };
            }).sort((a, b) => b.price - a.price);
        }

        return baseData.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeCategory, prices, searchTerm]);

    return (
        <div className="bg-[#030712] min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">
            {/* --- Coming Soon Overlay --- */}
            {activeCategory !== 'crypto' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md transition-all duration-300">
                    <div className="bg-[#111827] border border-slate-800 p-10 rounded-[2.5rem] text-center max-w-sm shadow-2xl shadow-blue-500/10">
                        {/* <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-5 h-5 text-blue-500" />
                        </div> */}
                        <h2 className="text-xl font-bold mb-3 tracking-tight">Market Locked</h2>
                        <p className="text-md mb-8 leading-relaxed">
                            We're currently calibrating the {activeCategory} price feeds. Please stick with Crypto for now!
                        </p>
                        <button
                            onClick={() => setActiveCategory('crypto')}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-black font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 text-sm"
                        >
                            Back to Active Assets
                        </button>
                    </div>
                </div>
            )}

            {/* --- Global Header --- */}
            <header className="sticky top-0 z-30 bg-[#030712]/70 backdrop-blur-2xl border-b border-slate-800/50">
                <div className="max-w-2xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                                <LayoutGrid className="w-6 h-6 text-blue-500" />
                                MARKETS
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-0.5">Real-time Data</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">Live</span>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                        {categories.map(cat => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border ${isActive
                                            ? 'bg-white text-black border-white shadow-xl shadow-white/5 scale-105'
                                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                                        }`}
                                >
                                    <cat.icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-500'}`} />
                                    {cat.label.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-8 pb-32">
                {/* --- Search Interface --- */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        className="w-full bg-[#111827] border border-slate-800 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm font-medium placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                        placeholder={`Search ${activeCategory} assets by name or ticker...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* --- Market Stats Header --- */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-1 h-5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]`} />
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">
                            {activeCategory} Overview
                        </h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500">{filteredData.length} Assets</p>
                </div>

                {/* --- Asset List --- */}
                <div className="space-y-3">
                    {filteredData.length > 0 ? (
                        filteredData.map(item => (
                            <div key={item.name} className="transition-transform active:scale-[0.98]">
                                <MarketCard
                                    {...item}
                                    onClick={() => navigate(`/coin/${item.name}`)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="inline-flex p-5 rounded-3xl bg-slate-900 mb-4 border border-slate-800">
                                <Search className="w-8 h-8 text-slate-700" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-300">No assets found</h4>
                            <p className="text-sm text-slate-500 mt-1">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                body { overflow-x: hidden; }
            `}</style>
        </div>
    );
};

export default MarketList;
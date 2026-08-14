import React from 'react';
import { Card } from "./ui/card";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Bitcoin,
    Gem,
    CircleDollarSign
} from "lucide-react";

// DEFINED OUTSIDE AND ABOVE TO PREVENT REFERENCE ERRORS
const marketIcons = {
    bitcoin: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    solana: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    binancecoin: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2.png",
    ripple: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    cardano: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    dogecoin: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    polkadot: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
    tron: "https://assets.coingecko.com/coins/images/1094/small/tron.png",
    polygon: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    avalanche: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    near: "https://assets.coingecko.com/coins/images/10365/small/near.png",
    cosmos: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
    aptos: "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
    sui: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.png",
    optimism: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    arbitrum: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    fantom: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
    stacks: "https://assets.coingecko.com/coins/images/2069/small/Stacks_logo_full.png",
    celestia: "https://assets.coingecko.com/coins/images/31967/small/tia.png",
    uniswap: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
    aave: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
    chainlink: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    "lido-dao": "https://assets.coingecko.com/coins/images/13573/small/LDO.png",
    thorchain: "https://assets.coingecko.com/coins/images/6595/small/RUNE.png",
    pancakeswap: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_copy.png",
    "internet-computer": "https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png",
    "fetch-ai": "https://assets.coingecko.com/coins/images/5681/small/Fetch.png",
    pepe: "https://assets.coingecko.com/coins/images/31358/small/pepe.png",
    "shiba-inu": "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
    dogwifhat: "https://assets.coingecko.com/coins/images/33503/small/dogwifhat.png",
    litecoin: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
    "bitcoin-cash": "https://assets.coingecko.com/coins/images/780/small/bitcoin-cash.png",
    "ethereum-classic": "https://assets.coingecko.com/coins/images/453/small/ethereum-classic.png",
    stellar: "https://assets.coingecko.com/coins/images/100/small/stellar.png",
    algorand: "https://assets.coingecko.com/coins/images/4380/small/download.png",
    vechain: "https://assets.coingecko.com/coins/images/1167/small/Vechain-Logo-700x700.png",
    "hedera-hashgraph": "https://assets.coingecko.com/coins/images/3688/small/hbar.png",
    filecoin: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
    default: "https://assets.codepen.io/ss/placeholder.svg"
};

export default function MarketCard({ 
    name, 
    symbol, 
    price, 
    change, 
    onClick, 
    category = 'crypto',
    optionType
}) {
    const changeColor = change > 0 ? "text-emerald-400" : "text-rose-400";
    const changeBg = change > 0 ? "bg-emerald-500/10" : "bg-rose-500/10";
    
    const getIcon = () => {
        const lowerName = name?.toLowerCase() || '';
        if (marketIcons[lowerName]) return marketIcons[lowerName];
        if (category === 'stocks') return BarChart3;
        if (category === 'metals') return Gem;
        if (category === 'forex') return CircleDollarSign;
        return null;
    };
    
    const iconResult = getIcon();
    const isImageUrl = typeof iconResult === 'string';
    const IconComponent = !isImageUrl ? iconResult : null;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-xl overflow-hidden py-1 max-w-2xl m-auto cursor-pointer"
        >
            <Card className="text-white border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-colors">
                <div onClick={onClick} className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl border border-gray-800 flex items-center justify-center flex-shrink-0">
                            {isImageUrl ? (
                                <img src={iconResult} alt={name} className="w-7 h-7 object-contain" />
                            ) : IconComponent ? (
                                <IconComponent className="w-5 h-5 text-gray-400" />
                            ) : (
                                <span className="text-emerald-400 font-bold text-sm uppercase">{name?.charAt(0)}</span>
                            )}
                        </div>
                        
                        <div className="min-w-0">
                            <h2 className="font-semibold text-sm sm:text-base truncate">
                                {name?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </h2>
                            <p className="text-xs text-gray-500 font-mono uppercase">{symbol?.replace('USDT', '')}</p>
                        </div>
                    </div>

                    <div className="text-right ml-4">
                        <p className="font-bold text-base sm:text-lg">
                            ${price?.toLocaleString(undefined, { 
                                minimumFractionDigits: price < 1 ? 6 : 2,
                                maximumFractionDigits: price < 1 ? 6 : 2 
                            })}
                        </p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${changeBg} ${changeColor} text-xs font-bold`}>
                            {change >= 0 ? '+' : ''}{change?.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
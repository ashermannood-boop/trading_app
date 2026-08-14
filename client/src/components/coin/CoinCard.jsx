// src/components/CoinCard.jsx
//import { Card, CardContent } from "@/components/ui/card";
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets.js";
import {
    TrendingUp,
    TrendingDown,

} from "lucide-react";

import { ClipLoader } from "react-spinners";
const coinIcons = {
    bitcoin: assets.bitcoin,
    ethereum: assets.ethereum,
    tether: assets.tether,
    ripple: assets.xrp,
    binancecoin: assets.binance,
    solana: assets.solana,
    usdc: assets.usdc,
    dogecoin: assets.dogs,
    cardano: assets.cardano,
    polkadot: assets.polkadot,
    //uniswap: assets.uniswap,
    tron: assets.tron,
    polygon: assets.polygon,
    avalanche: assets.avalanche,
    near: assets.near,
    cosmos: assets.cosmos,
    aptos: assets.aptos,
    sui: assets.sui,
    optimism: assets.optimism,
    arbitrum: assets.arbitrum,
    fantom: assets.fantom,
    stacks: assets.stacks,
    celestia: assets.celestia,
    uniswap: assets.uniswap,
    aave: assets.aave,
    chainlink: assets.chainlink,
    "lido-dao": assets["lido-dao"],
    thorchain: assets.thorchain,
    pancakeswap: assets.pancakeswap,
    "internet-computer": assets["internet-computer"],
    "fetch-ai": assets["fetch-ai"],
    pepe: assets.pepe,
    "shiba-inu": assets["shiba-inu"],
    dogwifhat: assets.dogwifhat,
    litecoin: assets.litecoin,
    "bitcoin-cash": assets["bitcoin-cash"],
    "ethereum-classic": assets["ethereum-classic"],
    stellar: assets.stellar,
    algorand: assets.algorand,
    vechain: assets.vechain,
    "hedera-hashgraph": assets["hedera-hashgraph"],
    filecoin: assets.filecoin,
    default: assets.default
    


};

export default function CoinCard({ name, symbol, price, change, onClick }) {
    const changeColor = change > 0 ? "text-green-500" : "text-red-500";
    const icon = coinIcons[name.toLowerCase()] || "";

    return (
        <motion.div

            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden py-2 sm:p-3 max-w-2xl m-auto cursor-pointer"
        >


            <Card className=" text-white border  border-gray-50">
                <div
                    onClick={() => onClick()}
                    className={`px-3 py-4 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 shadow-sm ${name === 'Loading...' ? 'animate-pulse' : ''}`}>
                    <div onClick={onClick} className="flex items-center gap-3">
                        {name !== 'Loading...' && (
                            <img src={icon} alt={name} className="w-8 h-8" />
                        )}
                        <div>
                            <h2 className="font-semibold">

                                {name == 'Loading...' && (
                                    <ClipLoader color="#2196F3" size={25} />
                                )}
                                {name !== 'Loading...' && (
                                    name.charAt(0).toUpperCase() + name.slice(1)
                                )}




                                {/* <span className="lowercase text-gray-300">{symbol}</span> */}
                            </h2>
                            <p className="text-sm text-gray-400">

                            </p>

                            {name !== 'Loading...' && (
                                "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            )}
                        </div>
                    </div>


                    <p className={`font-semibold ${changeColor} flex items-center gap-2 bg-green-200/10 px-2 py-1 rounded-md`}>
                        {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {change.toFixed(2)}%
                    </p>
                </div>
            </Card>
        </motion.div>
    );
}

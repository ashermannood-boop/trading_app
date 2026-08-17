import React from "react";
import { BadgeDollarSign } from "lucide-react";

export default function HomeAssetList({
  walletData = { usdt: 0, btc: 0, eth: 0, loanUsdt: 0 },
  marketPrices = null,
  assets = {},
  showBalance = true,
}) {
  const assetItems = [
    {
      currency: "USDT",
      name: "Tether",
      balance: walletData.usdt || 0,
      logo: assets?.tether,
      price: 1,
      change: 0,
      usdValue: walletData.usdt || 0,
      isStablecoin: true,
    },
    {
      currency: "BTC",
      name: "Bitcoin",
      balance: walletData.btc || 0,
      logo: assets?.bitcoin,
      price: marketPrices?.BTC?.price || 0,
      change: marketPrices?.BTC?.change24h || 0,
      usdValue: (walletData.btc || 0) * (marketPrices?.BTC?.price || 0),
      isStablecoin: false,
    },
    {
      currency: "ETH",
      name: "Ethereum",
      balance: walletData.eth || 0,
      logo: assets?.ethereum,
      price: marketPrices?.ETH?.price || 0,
      change: marketPrices?.ETH?.change24h || 0,
      usdValue: (walletData.eth || 0) * (marketPrices?.ETH?.price || 0),
      isStablecoin: false,
    },
  ];

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Your Assets</h3>
        <span className="text-xs text-gray-400">Holdings</span>
      </div>

      <div className="space-y-2">
        {assetItems.map((item) => {
          const isPositive = item.change >= 0;

          return (
            <div
              key={item.currency}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/80 border border-gray-800/60 transition-all"
            >
              {/* Asset Icon & Symbol */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center p-1.5 border border-gray-700/50">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.currency}
                      className="w-full h-full object-contain rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      {item.currency[0]}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">
                      {item.currency}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {item.name}
                    </span>
                  </div>

                  {!item.isStablecoin && item.price > 0 && (
                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                      <span className="text-gray-400">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`font-medium ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {item.change.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Asset Balance & Value */}
              <div className="text-right">
                <div className="font-bold text-white text-sm">
                  {showBalance
                    ? `$${item.usdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "••••••"}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {showBalance
                    ? `${parseFloat(item.balance).toFixed(4)} ${item.currency}`
                    : "••••"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import CoinList from "../components/coin/CoinList";
import MobileNav from "../components/MobileNav";
import GetStart from "../components/GetStart";
import VerifyAccountModal from "../components/VerifyAccountModal";
import TawkButton from "../components/TawkButton.jsx";
import HomeBalanceCard from "../components/HomeBalanceCard";
import ConvertModal from "../components/ConvertModal";

import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Home = () => {
  const { isLogin, userData, backendUrl, token } = useAuth();

  const [openConvert, setOpenConvert] = useState(false);
  const [walletData, setWalletData] = useState({ usdt: 0, btc: 0, eth: 0, loanUsdt: 0 });
  const [marketPrices, setMarketPrices] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const verifyOpen = isLogin && userData && !userData.isAccountVerified;

  // Fetch Live Market Prices
  const getMarketPrices = async () => {
    if (!token) return;
    try {
      setPriceLoading(true);
      const response = await axios.get(`${backendUrl}api/conversions/prices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMarketPrices(response.data.data);
        setLastUpdated(response.data.timestamp);
      }
    } catch (error) {
      console.error("Failed to fetch market prices:", error);
    } finally {
      setPriceLoading(false);
    }
  };

  // Fetch User Wallet Balance
  const fetchWallet = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setWalletData(res.data.user.wallet);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchWallet();
      getMarketPrices();

      const intervalId = setInterval(getMarketPrices, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isLogin]);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 pb-20">
      <Header />

      {/* Balance Section (Only visible when logged in) */}
      {isLogin && (
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
          <HomeBalanceCard
            walletData={walletData}
            marketPrices={marketPrices}
            lastUpdated={lastUpdated}
            priceLoading={priceLoading}
            onRefreshPrices={getMarketPrices}
            onOpenConvert={() => setOpenConvert(true)}
          />
        </div>
      )}

      {/* Hero Section (Unconstrained / Full Width) */}
      <Hero />

      {/* Coin List Section (Unconstrained / Full Width) */}
      <CoinList />

      <MobileNav />
      <TawkButton />

      {!isLogin && <GetStart />}

      <VerifyAccountModal open={verifyOpen} />

      {/* Quick Swap/Convert Modal */}
      {openConvert && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <ConvertModal
            open={openConvert}
            onClose={() => setOpenConvert(false)}
            onConvertSuccess={(conversionData) => {
              fetchWallet();
              toast.success(`Converted ${conversionData.amount} ${conversionData.from} to USDT`);
            }}
            cryptoAssets={{
              BTC: {
                icon: assets?.bitcoin,
                color: "text-orange-500",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/30",
                price: marketPrices?.BTC?.price || 0,
                change: marketPrices?.BTC?.change24h || 0,
                name: "Bitcoin",
              },
              ETH: {
                icon: assets?.ethereum,
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/30",
                price: marketPrices?.ETH?.price || 0,
                change: marketPrices?.ETH?.change24h || 0,
                name: "Ethereum",
              },
            }}
            userBalance={walletData}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
import React from 'react'
import MarketList from '../components/MarketList';
import MobileNav from '../components/MobileNav';
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from 'lucide-react';
const Markets = () => {
    const navigate = useNavigate();

  return (
    <div>
        <div className="hidden sm:block bg-gray-950 sticky top-0 z-50">
                  <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft size={20} />
                        <span className="font-medium">Back</span>
                      </button>
                      {/* <h1 className="text-lg font-semibold text-white">My Wallet</h1> */}
                      <div className="w-20"></div> {/* Spacer for alignment */}
                    </div>
                  </div>
                </div>
      <MarketList />
        <MobileNav />
    </div>
  )
}

export default Markets
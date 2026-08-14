import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, ArrowRight, Wallet, ArrowRightLeft, ShieldAlert, Percent, Clock } from 'lucide-react';

const OrderCompletionModal = ({ order, onClose }) => {
  if (!order) return null;

  // 1. Core State Identification
  const isWin = order.wasForceWin || order.profit > 0;
  const statusColor = isWin ? 'emerald' : 'rose';

  // Parse numerical metrics safely
  const amount = parseFloat(order.amount) || 0;
  const cleanEntryPrice = parseFloat(order.entryPrice) || 0;
  let displayExitPrice = parseFloat(order.exitPrice) || cleanEntryPrice;

  // 2. Clear visual path separation (0.1% ensures a recognizable difference on screen)
  if (order.wasForceWin) {
    const deviationPercent = 0.001; // 0.1% difference makes the win visually obvious

    if (order.direction === 'buy') {
      displayExitPrice = cleanEntryPrice * (1 + deviationPercent);
    } else if (order.direction === 'sell') {
      displayExitPrice = cleanEntryPrice * (1 - deviationPercent);
    }
  } else {
     const deviationPercent = 0.001;

    if (order.direction === 'buy') {
      displayExitPrice = cleanEntryPrice * (1 - deviationPercent);
    } else if (order.direction === 'sell') {
      displayExitPrice = cleanEntryPrice * (1 + deviationPercent);
    }

  }

  // 3. Dynamic Fee & PNL Calculations
  //const feeRate = 0.02; // 2%
  const feeRate = 0
  const calculatedFee = amount * feeRate;
  const returnRate = order.expectedReturn || 12;
  const expectedReturnAmount = (amount * returnRate) / 100;

  const displayProfit = order.wasForceWin && order.profit <= 0 ? expectedReturnAmount : order.profit;
  const payout = order.wasForceWin ? (amount + displayProfit) : order.actualPayout;
  const startDate = order.formattedDate || new Date(order.startTime).toLocaleString();

  // Responsive device view variant animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 50,
      scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 28, stiffness: 320 }
    },
    exit: {
      opacity: 0,
      y: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 30,
      scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md">

        {/* Dynamic ambient background blur glow */}
        <div className={`hidden sm:block absolute w-80 h-80 rounded-full blur-[130px] opacity-25 transition-all duration-500 bg-${statusColor}-500`} />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md overflow-hidden bg-slate-900 sm:rounded-[2.5rem] rounded-t-[2rem] border-t sm:border border-slate-800 shadow-2xl max-h-[96vh] flex flex-col"
        >
          {/* Top Status Gradient Trim */}
          <div className={`h-1.5 w-full flex-shrink-0 ${isWin ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`} />

          {/* Close Trigger Icon */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:bg-slate-800 hover:text-white transition-all z-10"
          >
            <X size={18} />
          </button>

          {/* Content Wrapper */}
          <div className="p-5  overflow-y-auto no-scrollbar hide-scrollbar .hide-scrollbar::-webkit-scrollbar">

            {/* Header Module */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 }}
                className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 rounded-2xl ${
                  isWin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {isWin ? <TrendingUp size={28} className="sm:size-8" /> : <TrendingDown size={28} className="sm:size-8" />}
              </motion.div> */}

              <h2 className="text-xl  font-black text-white tracking-tight">
                {isWin ? 'TRADE SUCCESS' : 'TRADE CLOSED'}
              </h2>

              {/* Asset Identity Badging */}
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-slate-950/40 rounded-full border border-slate-800 text-[11px] sm:text-xs">
                <span className="font-bold text-white font-mono">{order.symbol}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className={`font-black uppercase ${order.direction === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {order.direction}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-slate-400 font-medium tracking-wide flex items-center gap-1">
                  <Clock size={11} /> {order.duration}s
                </span>
              </div>
            </div>

            {/* Price Visualization Panel */}
            <div className="mb-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Entry Price</span>
                <div className="flex items-center gap-1">
                  <span>Exit Price</span>
                  {order.wasForceWin && <ShieldAlert size={11} className="text-emerald-400" />}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-mono text-base font-semibold">
                    ${cleanEntryPrice.toFixed(6)}
                  </span>
                </div>

                <ArrowRightLeft size={14} className="text-slate-700 mx-2 flex-shrink-0" />

                <div className="flex flex-col items-end">
                  <span className={`font-mono text-base font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${displayExitPrice.toFixed(6)}
                  </span>

                </div>
              </div>
            </div>

            {/* Core Stats Metric Matrix */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-800/20 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-0.5">Amount</span>
                <div className="flex items-center gap-1.5">
                  <Wallet size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="text-white font-mono font-bold text-sm sm:text-base">${amount.toFixed(2)}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isWin ? 'bg-emerald-500/[0.02] border-emerald-500/20' : 'bg-rose-500/[0.02] border-rose-500/20'}`}>
                <span className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-0.5">Net PNL</span>
                <span className={`font-mono text-sm sm:text-base font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isWin ? `+$${Math.abs(displayProfit).toFixed(2)}` : `-$${Math.abs(displayProfit).toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Mini Detail Breakdown Area */}
            <div className="mb-5 rounded-xl bg-slate-950/20 border border-slate-800 text-xs text-slate-400 overflow-hidden divide-y divide-slate-800/40">
              <div className="flex justify-between items-center p-2.5 px-3">
                <span className="flex items-center gap-1"><Percent size={12} className="text-slate-500" /> Trading Fee (free)</span>
                <span className="font-mono text-amber-400 font-semibold">${calculatedFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 px-3">
                <span>Return Rate / Expected</span>
                <span className="font-mono text-slate-300 font-medium">{returnRate}% (${expectedReturnAmount.toFixed(2)})</span>
              </div>
              <div className="flex justify-between items-center p-2.5 px-3 text-[11px] text-slate-500">
                <span>Started At</span>
                <span className="font-mono text-right truncate pl-4">{startDate}</span>
              </div>
            </div>

            {/* Payout Metric Callout */}
            <div className="mb-6 px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-800 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-400 font-medium">Total Account Payout</span>
              <span className={`font-mono font-bold text-base ${isWin ? 'text-emerald-400' : 'text-white'}`}>
                ${Math.max(0, payout).toFixed(2)}
              </span>
            </div>

            {/* Premium Interactive Trigger Action */}
            <motion.button
              whileHover={{ scale: 1.015, y: -0.5 }}
              whileTap={{ scale: 0.985 }}
              onClick={onClose}
              className={`group w-full py-3.5 px-6 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${isWin
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-slate-950/50'
                }`}
            >
              Continue Trading
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderCompletionModal;
// components/OrderModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { X, TrendingUp, TrendingDown, Clock, Zap, Shield, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import ConvertModal from "./ConvertModal";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";

const DURATIONS = [
    { id: 30, rate: 12, min: 100, max: 5000 },
    { id: 60, rate: 18, min: 5000, max: 10000 },
    { id: 90, rate: 20, min: 10000, max: 15000 },
    { id: 120, rate: 22, min: 15000, max: 20000 },
    { id: 180, rate: 25, min: 20000, max: 30000 },
    { id: 240, rate: 28, min: 30000, max: 40000 },
    { id: 365, rate: 30, min: 40000, max: 60000 }
];

export default function OrderModal({
    open,
    onClose,
    symbol,
    price = 0,
    onConfirm,
    direction,
    availableAmount,
    isCheckingEligibility = false,
    userBalance,
    marketPrices
}) {
    const {
        orderLoading,
        setOrderLoading,
        isDemoMode
    } = useAuth();

    const [selected, setSelected] = useState(30);
    const [amount, setAmount] = useState("");
    const [leverage] = useState(1);
    const [error, setError] = useState("");
    const [calculating, setCalculating] = useState(false);
    const [openConvert, setOpenConvert] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount("");
            setError("");
            setSelected(30);
        }
    }, [open]);

    const selectedItem = useMemo(() => DURATIONS.find((d) => d.id === selected), [selected]);

    const cryptoAssets = useMemo(() => ({
        BTC: {
            icon: assets?.bitcoin,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/30",
            price: marketPrices?.BTC?.price || 0,
            change: marketPrices?.BTC?.change24h || 0,
            name: "Bitcoin"
        },
        ETH: {
            icon: assets?.ethereum,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/30",
            price: marketPrices?.ETH?.price || 0,
            change: marketPrices?.ETH?.change24h || 0,
            name: "Ethereum"
        }
    }), [marketPrices]);

    const calculateReturn = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount === 0 || !selectedItem) return "0.00";
        const base = numAmount * (selectedItem.rate / 100);
        return (base * leverage).toFixed(2);
    };

    const calculateFee = () => "0.00";

    const calculateTotalPayout = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount === 0) return "0.00";
        const returnAmount = parseFloat(calculateReturn());
        return (numAmount + returnAmount).toFixed(2);
    };

    const handleAmountChange = (value) => {
        setAmount(value);
        setError("");
        setCalculating(true);

        if (value && selectedItem) {
            const numValue = parseFloat(value);
            if (numValue < selectedItem.min) {
                setError(`Minimum amount is $${selectedItem.min}`);
            } else if (numValue > selectedItem.max) {
                setError(`Maximum amount is $${selectedItem.max}`);
            } else if (numValue > availableAmount * leverage) {
                setError(`Insufficient available balance for ${leverage}x leverage`);
            }
        }

        const timer = setTimeout(() => setCalculating(false), 250);
        return () => clearTimeout(timer);
    };

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount === 0) {
            setError("Please enter a valid amount");
            return;
        }
        if (error) return;

        if (onConfirm) {
            onConfirm({
                symbol,
                price,
                duration: selected,
                amount: numAmount,
                leverage,
                expectedReturn: parseFloat(calculateReturn()),
                fee: parseFloat(calculateFee()),
                totalPayout: parseFloat(calculateTotalPayout()),
                direction,
            });
        }
        setOrderLoading(true);
    };

    const formatCurrency = (value) => {
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
                <div
                    className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${direction === 'buy' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                    {direction === 'buy' ?
                                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" /> :
                                        <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
                                    }
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg sm:text-xl flex items-center gap-1.5">
                                        {direction === 'buy' ? 'Buy' : 'Sell'} {symbol}
                                        {isDemoMode && <span className="text-[10px] font-normal text-amber-500 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">Demo</span>}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">${formatCurrency(price)}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-5">
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-3.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-green-700 dark:text-green-400">Available Balance</span>
                                <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(availableAmount)} USDT</span>
                            </div>
                            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-green-200/40 dark:border-green-900/40 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">
                                    {availableAmount < (selectedItem?.min || 0) ? `Minimum allocation requires $${selectedItem?.min}` : "Standard profile verification rules apply."}
                                </span>
                                {!isDemoMode && (
                                    <button onClick={() => setOpenConvert(true)} className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400 hover:underline">
                                        <RefreshCw className="w-3 h-3" /> Convert Funds
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Term Duration</label>
                            <div className="grid grid-cols-3 gap-2">
                                {DURATIONS.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setError('');
                                            setAmount('');
                                            setSelected(item.id);
                                        }}
                                        className={`p-3 rounded-xl border text-center transition-all ${selected === item.id
                                            ? "border-green-500 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold"
                                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:hover:border-gray-700"
                                            }`}
                                    >
                                        <div className="text-sm">{item.id}s</div>
                                        <div className="text-xs opacity-80 mt-0.5">+{item.rate}%</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Position Size (USDT)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                <input
                                    value={amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    placeholder={`Range: ${selectedItem?.min} - ${selectedItem?.max}`}
                                    type="number"
                                    className="w-full p-3 pl-8 text-base rounded-xl border border-gray-200 dark:border-gray-400 bg-transparent focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-2.5 text-sm">
                            {calculating ? (
                                <div className="text-center py-2 text-gray-400 text-xs flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-green-500"></div> Re-pricing allocation...
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Yield Return</span>
                                        <span className="text-green-500 font-medium">+${formatCurrency(calculateReturn())}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Processing Fee (Free)</span>
                                        <span className="text-green-500 font-medium">$0.00</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between font-semibold text-base">
                                        <span>Total Account Payout</span>
                                        <span>${formatCurrency(calculateTotalPayout())}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!!error || !amount || parseFloat(amount) === 0 || isCheckingEligibility || orderLoading}
                            className={`w-full py-3.5 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 shadow-sm ${direction === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {isCheckingEligibility ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Evaluating Eligibility...
                                </>
                            ) : orderLoading ? (
                                <>
                                    <ClipLoader color="#ffffff" size={16} />
                                    proccessing order...
                                </>
                            ) : (
                                `Confirm Execution (${direction === 'buy' ? 'Buy' : 'Sell'})`
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {openConvert && !isDemoMode && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <ConvertModal
                        open={openConvert}
                        onClose={() => setOpenConvert(false)}
                        onConvertSuccess={(conversionData) => {
                            toast.success(`Converted ${conversionData.amount} ${conversionData.from} to USDT`);
                        }}
                        cryptoAssets={cryptoAssets}
                        userBalance={userBalance}
                    />
                </div>
            )}
        </>
    );
}
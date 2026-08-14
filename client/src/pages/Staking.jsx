import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    TrendingUp,
    ShieldCheck,
    Wallet,
    Clock,
    ArrowDownLeft,
    ArrowUpRight,
    AlertCircle,
    Loader2,
    CheckCircle2,
    MoveLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MobileNav from '../components/MobileNav';
import { tradeAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StakingDashboard() {
    const { backendUrl, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalStakedUsdt: 0,
        totalEarnedUsdt: 0,
        estimatedDailyYield: 0,
        apy: 0.034,
    });
    const [positions, setPositions] = useState([]);
    const [recentPayouts, setRecentPayouts] = useState([]);
    const navigate = useNavigate();

    // Form states
    const [selectedAsset, setSelectedAsset] = useState("USDT");
    const [amount, setAmount] = useState("");
    const [userWalletBalance, setUserWalletBalance] = useState(0);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // Fetch initial data
    const fetchStakingData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}api/staking/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (data.success) {
                setSummary(data.summary);
                setPositions(data.positions);
                setRecentPayouts(data.recentPayouts);
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to load staking data", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBalance = async () => {
        try {
            const result = await tradeAPI.getUserBalance();
            if (result.success) {
                setUserWalletBalance(result.data.wallet.usdt);
            }
        } catch (error) {
            showToast('Failed to fetch real balance', 'error');
        }
    };

    useEffect(() => {
        fetchUserBalance();
        fetchStakingData();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    };

    // Handle Stake Submit
    const handleStake = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return showToast("Please enter a valid amount", "error");
        if (parseFloat(amount) > userWalletBalance) return showToast("Insufficient wallet balance", "error");

        setActionLoading(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}api/staking/stake`,
                { asset: selectedAsset, amount: parseFloat(amount) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                showToast("Successfully staked assets!");
                setAmount("");
                fetchStakingData();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Staking transaction failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Unstake Submit    
    const handleUnstake = async (positionId) => {
        if (!window.confirm("Are you sure you want to unstake? Yields accrued will be credited to your balance.")) return;

        setActionLoading(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}api/staking/unstake/${positionId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                showToast(data.message);
                fetchStakingData();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Unstaking failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Calculation Previews based on APY
    const parsedAmount = parseFloat(amount) || 0;
    const dailyRate = Math.pow(1 + summary.apy, 1 / 365) - 1;
    const projectedDaily = (parsedAmount * dailyRate).toFixed(4);
    const projectedYearly = (parsedAmount * summary.apy).toFixed(2);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6 text-slate-100">
            {/* Back Button */}
            <div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <MoveLeft className="mr-2 w-4 h-4" />
                    <span>Back</span>
                </button>
            </div>

            {/* Toast Alert */}
            {toast.show && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl transition-all ${toast.type === "error"
                    ? "bg-rose-950/90 border-rose-800 text-rose-200"
                    : "bg-blue-950/90 border-blue-800 text-blue-200"
                    }`}>
                    {toast.type === "error" ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <span className="text-sm">{toast.message}</span>
                </div>
            )}

            {/* Header Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-2xl">
                <div>
                    <div className="inline-flex items-center gap-2 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full mb-2 sm:mb-3">
                        <ShieldCheck className="w-3.5 h-3.5" /> Daily Automated Staking
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold">Earn High-Yield Interest</h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        Lock crypto assets with daily compounding rewards distributed at 00:00 UTC.
                    </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 px-4 py-3 sm:px-5 sm:py-4 rounded-xl flex items-center gap-4 shrink-0 justify-between sm:justify-start">
                    <div className="p-2.5 sm:p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-right sm:text-left">
                        <div className="text-xs text-slate-400 font-medium">Standard APY</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-400">{(summary.apy * 100).toFixed(2)}%</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-slate-500 shrink-0" /> Active Staked Balance
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">${summary.totalStakedUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[11px] text-slate-500 mt-1 sm:mt-2">Principal generating daily interest</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" /> Estimated Daily Return
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">+${summary.estimatedDailyYield.toFixed(4)}</div>
                    <div className="text-[11px] text-slate-500 mt-1 sm:mt-2">Next distribution at midnight UTC</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <ArrowUpRight className="w-4 h-4 text-blue-500 shrink-0" /> Total Earnings Paid
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-200">${summary.totalEarnedUsdt.toLocaleString(undefined, { minimumFractionDigits: 4 })}</div>
                    <div className="text-[11px] text-blue-400/90 mt-1 sm:mt-2">All-time compounded yield</div>
                </div>
            </div>

            {/* Main Form & Active Positions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Stake Input Action Box */}
                <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl h-fit space-y-4 sm:space-y-5">
                    <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <ArrowDownLeft className="w-5 h-5 text-blue-400" /> Stake Crypto
                    </h2>

                    <form onSubmit={handleStake} className="space-y-4">
                        {/* Asset Selector */}
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Select Asset</label>
                            <select
                                value={selectedAsset}
                                onChange={(e) => setSelectedAsset(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-sm"
                            >
                                <option value="USDT">USDT (Tether)</option>
                                {/* <option value="BTC">BTC (Bitcoin)</option>
                                <option value="ETH">ETH (Ethereum)</option> */}
                            </select>
                        </div>

                        {/* Input Amount */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span>Amount to Stake</span>
                                <span>Wallet: ${userWalletBalance.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white pl-3.5 pr-14 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setAmount(userWalletBalance.toString())}
                                    className="absolute right-2.5 top-2 sm:top-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2 py-1 rounded-md transition-colors"
                                >
                                    MAX
                                </button>
                            </div>
                        </div>

                        {/* Live Calculation Preview */}
                        {parsedAmount > 0 && (
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-400">
                                    <span>Est. Daily Yield:</span>
                                    <span className="text-blue-400 font-mono font-medium">+${projectedDaily}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Est. Yearly Return:</span>
                                    <span className="text-blue-400 font-mono font-medium">+${projectedYearly}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Stake Assets Now"}
                        </button>
                    </form>
                </div>

                {/* Active Positions Container */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-4">
                    <h2 className="text-base sm:text-lg font-semibold">Active Staking Positions</h2>

                    {positions.length === 0 ? (
                        <div className="text-center py-10 sm:py-12 text-slate-500 text-xs sm:text-sm">
                            No active staking positions. Stake assets above to start earning daily rewards.
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card Layout (< md screens) */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {positions.map((pos) => (
                                    <div key={pos._id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded text-xs font-bold">
                                                    {pos.asset}
                                                </span>
                                                <span className="text-xs text-blue-400 font-medium">
                                                    {(pos.apy * 100).toFixed(2)}% APY
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${pos.status === "active" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                                                }`}>
                                                {pos.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <div className="text-slate-400 text-[11px]">Principal</div>
                                                <div className="font-mono font-medium text-slate-200 mt-0.5">
                                                    ${pos.stakedAmount.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-400 text-[11px]">Earned Yield</div>
                                                <div className="font-mono font-medium text-blue-400 mt-0.5">
                                                    +${pos.accumulatedYield.toFixed(4)}
                                                </div>
                                            </div>
                                        </div>

                                        {pos.status === "active" && (
                                            <div className="pt-1">
                                                <button
                                                    onClick={() => handleUnstake(pos._id)}
                                                    disabled={actionLoading}
                                                    className="w-full bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs py-2 rounded-lg border border-slate-700 hover:border-rose-800 transition-all font-medium"
                                                >
                                                    Unstake
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table Layout (>= md screens) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-xs text-slate-400">
                                            <th className="py-3 px-2">Asset</th>
                                            <th className="py-3 px-2">Principal</th>
                                            <th className="py-3 px-2">APY Rate</th>
                                            <th className="py-3 px-2">Earned Yield</th>
                                            <th className="py-3 px-2">Status</th>
                                            <th className="py-3 px-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {positions.map((pos) => (
                                            <tr key={pos._id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="py-4 px-2 font-bold flex items-center gap-2">
                                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">{pos.asset}</span>
                                                </td>
                                                <td className="py-4 px-2 font-mono font-medium">${pos.stakedAmount.toFixed(2)}</td>
                                                <td className="py-4 px-2 text-blue-400 font-medium">{(pos.apy * 100).toFixed(2)}%</td>
                                                <td className="py-4 px-2 font-mono text-blue-400">+${pos.accumulatedYield.toFixed(4)}</td>
                                                <td className="py-4 px-2">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${pos.status === "active" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                                                        }`}>
                                                        {pos.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2 text-right">
                                                    {pos.status === "active" && (
                                                        <button
                                                            onClick={() => handleUnstake(pos._id)}
                                                            disabled={actionLoading}
                                                            className="bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-800 transition-all"
                                                        >
                                                            Unstake
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
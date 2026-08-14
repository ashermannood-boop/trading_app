import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    ShieldAlert,
    RefreshCw,
    Edit2,
    Check,
    X,
    Search,
    Users,
    TrendingUp,
    Wallet,
    AlertCircle,
    Loader2,
    CheckCircle2,
    MoveLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminStaking() {
    const { backendUrl, token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [metrics, setMetrics] = useState({
        totalActiveStaked: 0,
        totalRewardsPaidOut: 0,
        totalActivePositions: 0,
    });
    const [positions, setPositions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAsset, setFilterAsset] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");

    // Inline APY edit tracking
    const [editingApyId, setEditingApyId] = useState(null);
    const [newApyInput, setNewApyInput] = useState("");

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    };

    const fetchAdminOverview = async () => {
        setLoading(true);
        try {
            console.warn('fetching admin overview with token:', token);
            const { data } = await axios.get(`${backendUrl}api/staking/admin/overview`,{
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000, // 15 seconds timeout

            });

            console.warn('testing admin overview data:', data ? data : 'no data');
            if (data.success) {
                setMetrics(data.metrics);
                setPositions(data.positions);
            }else{
                showToast(data.message || "Failed to load admin overview", "error");
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to load admin overview", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminOverview();
    }, []);

    const handleUpdateApy = async (positionId) => {
        const parsedPercentage = parseFloat(newApyInput);
        if (isNaN(parsedPercentage) || parsedPercentage < 0) {
            return showToast("Please enter a valid APY percentage", "error");
        }

        const rate = parsedPercentage / 100; // e.g. 3.4 -> 0.034
        setActionLoading(true);

        try {
            const { data } = await axios.patch(
                `${backendUrl}api/staking/admin/update-apy/${positionId}`,
                { newApy: rate },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.success) {
                showToast("APY rate updated successfully");
                setEditingApyId(null);
                fetchAdminOverview();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update APY rate", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleForceClose = async (positionId) => {
        if (!window.confirm("Force close this position? Principal and accrued yield will be returned to the user.")) {
            return;
        }

        setActionLoading(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}api/staking/admin/force-close/${positionId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.success) {
                showToast(data.message || "Position closed");
                fetchAdminOverview();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to close position", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredPositions = positions.filter((pos) => {
        const userIdentifier = pos.userId?.email || pos.userId?.name || pos.userId?._id || "";
        const matchesSearch = userIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAsset = filterAsset === "ALL" || pos.asset === filterAsset;
        const matchesStatus = filterStatus === "ALL" || pos.status === filterStatus;
        return matchesSearch && matchesAsset && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6 text-slate-100">
            {/* Top Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <MoveLeft className="mr-2 w-4 h-4" />
                    <span>Back to App</span>
                </button>

                <button
                    onClick={fetchAdminOverview}
                    disabled={loading}
                    className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Toast Alert */}
            {toast.show && (
                <div
                    className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl transition-all ${toast.type === "error"
                            ? "bg-rose-950/90 border-rose-800 text-rose-200"
                            : "bg-blue-950/90 border-blue-800 text-blue-200"
                        }`}
                >
                    {toast.type === "error" ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <span className="text-sm">{toast.message}</span>
                </div>
            )}

            {/* Title Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-2xl">
                {/* <div className="inline-flex items-center gap-2 text-rose-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Admin Staking Control
                </div> */}
                <h1 className="text-xl sm:text-2xl font-bold">System Staking Overview</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Monitor aggregated liquidity, edit user APY parameters, and manage active contracts.
                </p>
            </div>

            {/* Aggregate Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-blue-500 shrink-0" /> Total Active Staked
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                        ${metrics.totalActiveStaked.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Active principal liquidity</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" /> Total Yield Paid Out
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                        +${metrics.totalRewardsPaidOut.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">All-time distributed rewards</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-xl">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-purple-400 shrink-0" /> Active Positions
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-200">{metrics.totalActivePositions}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Live earning user contracts</div>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 md:items-center justify-between">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by user email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterAsset}
                        onChange={(e) => setFilterAsset(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Assets</option>
                        <option value="USDT">USDT</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Positions Table / Mobile Card Layout */}
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-4">
                <h2 className="text-base sm:text-lg font-semibold">User Positions ({filteredPositions.length})</h2>

                {filteredPositions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs sm:text-sm">
                        No staking positions found.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card Layout (< md) */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {filteredPositions.map((pos) => (
                                <div key={pos._id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                                        <div>
                                            <div className="text-xs font-semibold text-slate-200">
                                                {pos.userId?.name || "User"}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{pos.userId?.email || "No email"}</div>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${pos.status === "active" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-500"
                                                }`}
                                        >
                                            {pos.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <div className="text-slate-400 text-[11px]">Asset & Principal</div>
                                            <div className="font-mono font-medium text-slate-200 mt-0.5">
                                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] mr-1">{pos.asset}</span>
                                                ${pos.stakedAmount.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-400 text-[11px]">Accrued Yield</div>
                                            <div className="font-mono font-medium text-emerald-400 mt-0.5">
                                                +${pos.accumulatedYield.toFixed(4)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* APY Controls */}
                                    <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                                        <span className="text-slate-400">APY Rate:</span>
                                        {editingApyId === pos._id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    placeholder="%"
                                                    value={newApyInput}
                                                    onChange={(e) => setNewApyInput(e.target.value)}
                                                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                                />
                                                <button
                                                    onClick={() => handleUpdateApy(pos._id)}
                                                    disabled={actionLoading}
                                                    className="p-1 bg-blue-500/20 text-blue-400 rounded"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingApyId(null)} className="p-1 bg-slate-800 text-slate-400 rounded">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-400 font-mono font-bold">{(pos.apy * 100).toFixed(2)}%</span>
                                                {pos.status === "active" && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingApyId(pos._id);
                                                            setNewApyInput((pos.apy * 100).toString());
                                                        }}
                                                        className="text-slate-500 hover:text-slate-300"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {pos.status === "active" && (
                                        <button
                                            onClick={() => handleForceClose(pos._id)}
                                            disabled={actionLoading}
                                            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-800/50 text-xs py-2 rounded-lg font-medium transition-all"
                                        >
                                            Force Close & Refund
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table (>= md) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-xs text-slate-400">
                                        <th className="py-3 px-2">User</th>
                                        <th className="py-3 px-2">Asset</th>
                                        <th className="py-3 px-2">Principal</th>
                                        <th className="py-3 px-2">APY</th>
                                        <th className="py-3 px-2">Accrued Yield</th>
                                        <th className="py-3 px-2">Status</th>
                                        <th className="py-3 px-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {filteredPositions.map((pos) => (
                                        <tr key={pos._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="font-semibold text-slate-200">{pos.userId?.name || "N/A"}</div>
                                                <div className="text-xs text-slate-500">{pos.userId?.email || "No email"}</div>
                                            </td>
                                            <td className="py-4 px-2 font-bold">
                                                <span className="bg-slate-800 px-2 py-1 rounded text-xs">{pos.asset}</span>
                                            </td>
                                            <td className="py-4 px-2 font-mono font-medium">${pos.stakedAmount.toFixed(2)}</td>
                                            <td className="py-4 px-2">
                                                {editingApyId === pos._id ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={newApyInput}
                                                            onChange={(e) => setNewApyInput(e.target.value)}
                                                            className="w-16 bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateApy(pos._id)}
                                                            disabled={actionLoading}
                                                            className="p-1 bg-blue-500/20 text-blue-400 rounded"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => setEditingApyId(null)} className="p-1 bg-slate-800 text-slate-400 rounded">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-400 font-mono font-medium">{(pos.apy * 100).toFixed(2)}%</span>
                                                        {pos.status === "active" && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingApyId(pos._id);
                                                                    setNewApyInput((pos.apy * 100).toString());
                                                                }}
                                                                className="text-slate-500 hover:text-slate-300"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-2 font-mono text-emerald-400">+${pos.accumulatedYield.toFixed(4)}</td>
                                            <td className="py-4 px-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${pos.status === "active" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                                                        }`}
                                                >
                                                    {pos.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                {pos.status === "active" && (
                                                    <button
                                                        onClick={() => handleForceClose(pos._id)}
                                                        disabled={actionLoading}
                                                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-800/50 text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                                                    >
                                                        Force Close
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
    );
}
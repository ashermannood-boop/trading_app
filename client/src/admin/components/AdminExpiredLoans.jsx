import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Check,
  X as XIcon,
  DollarSign,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Filter,
  Shield,
  ShieldAlert,
  Mail,
  User,
  Ban,
  AlertTriangle,
  TrendingDown,
  Users,
  DollarSign as Dollar,
  Clock3,
  FileText
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

export default function AdminExpiredLoans() {
  const { token,backendUrl } = useAuth();
 // const backendUrl = "http://localhost:3000/";
  const [status, setStatus] = useState("defaulted");
  const [openStatus, setOpenStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  const [showDetails, setShowDetails] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  // State for backend integration
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    totalAmountDefaulted: 0,
    avgDaysOverdue: 0,
    maxDaysOverdue: 0,
    minDaysOverdue: 0,
    blockedUsers: 0,
    distribution: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);
  const [processingAction, setProcessingAction] = useState(false);
  const [includeBlocked, setIncludeBlocked] = useState(false);
  const [daysOverdueMin, setDaysOverdueMin] = useState("");
  const [daysOverdueMax, setDaysOverdueMax] = useState("");

  const statuses = ["defaulted", "active", "all"];
  const statusLabels = {
    defaulted: "Defaulted",
    active: "Active (Overdue)",
    all: "All Overdue"
  };

  // Fetch expired loans from backend
  const fetchExpiredLoans = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const params = {
        page,
        limit: 10,
        sortBy: "daysOverdue",
        sortOrder: "desc",
        status: status === "all" ? undefined : status,
        includeBlockedUsers: includeBlocked,
      };

      // Add filters
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (daysOverdueMin) params.daysOverdueMin = parseInt(daysOverdueMin);
      if (daysOverdueMax) params.daysOverdueMax = parseInt(daysOverdueMax);

      const response = await axios.get(`${backendUrl}api/expired-loans/admin/expired`, {
        ...config,
        params
      });

      console.log("Fetched expired loans:", response);

      setLoans(response?.data?.data);
      setFilteredLoans(response?.data?.data);
      setTotalPages(response?.data?.pagination.pages);
      setTotalLoans(response?.data?.pagination.total);
    } catch (error) {
      //     console.error("Error fetching expired loans:", error);
      toast.error("Failed to load expired loans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch expired loan stats
  const fetchExpiredLoanStats = async () => {
    setLoadingStats(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${backendUrl}api/expired-loans/admin/expired/stats`, config);

      if (response.data.success) {
        setStats(response?.data?.data);
      }
    } catch (error) {
      console.log("Error fetching expired loan stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  // Run expired loan check
  const runExpiredCheck = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${backendUrl}api/expired-loans/admin/expired/check`, {}, config);
      console.log("Expired check response:", response);

      if (response.data.success) {
       /* toast.success(`Expired loan check completed: ${response.data.summary.markedDefaulted} marked as defaulted, ${response.data.summary.usersBlocked} users blocked`);*/
        toast.success(`Expired loan check completed successfully!`);
        fetchExpiredLoans();
        fetchExpiredLoanStats();
      }
    } catch (error) {
      console.error("Error running expired check:", error);
      toast.error(error.response?.data?.message || "Failed to run expired check");
    }
  };

  // Send reminder
  const sendReminder = async (loanId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${backendUrl}api/expired-loans/admin/expired/send-reminder/${loanId}`,
        {},
        config
      );

      if (response.data.success) {
        toast.success("Reminder sent successfully!");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  // Unblock user
  const unblockUser = async () => {
    if (!selectedLoan || !resolutionNote.trim()) {
      toast.error("Please enter a resolution note");
      return;
    }

    setProcessingAction(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      };

      const payload = {
        userId: selectedLoan.userId._id,
        resolutionNote
      };

      const response = await axios.post(
        `${backendUrl}api/expired-loans/admin/expired/unblock-user`,
        payload,
        config
      );

      if (response.data.success) {
        toast.success("User unblocked successfully!");
        setShowUnblockModal(false);
        setResolutionNote("");
        fetchExpiredLoans();
        fetchExpiredLoanStats();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    } finally {
      setProcessingAction(false);
    }
  };

  // Block user
  const blockUser = async (userId, loanId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // `${backendUrl}api/expired-loans/admin/expired/send-reminder/${loanId}`, 

      const response = await axios.post(
        `${backendUrl}api/expired-loans/admin/expired/block/${userId}`,
        { reason: "Loan default (9+ days overdue)" },
        config
      );
      

      /*
         const response = await axios.post(
           `${backendUrl}api/expired-loans/${userId}/block`,
           { reason: "Loan default (9+ days overdue)" },
           config
         );
      */

      if (response.data.success) {
        toast.success("User blocked successfully!");
        fetchExpiredLoans();
        fetchExpiredLoanStats();
        setShowBlockConfirm(false);
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchExpiredLoans();
    fetchExpiredLoanStats();
  }, [page, status, searchTerm, startDate, endDate, includeBlocked, daysOverdueMin, daysOverdueMax]);

  const getStatusIcon = (loan) => {
    if (loan.status === "defaulted") {
      if (loan.daysOverdue >= 90) {
        return <ShieldAlert className="h-3 w-3 text-red-500" />;
      } else if (loan.daysOverdue >= 60) {
        return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      } else {
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      }
    }
    if (loan.status === "active") return <Clock className="h-3 w-3 text-purple-500" />;
    return <Clock className="h-3 w-3 text-gray-500" />;
  };

  const getStatusColor = (loan) => {
    if (loan.status === "defaulted") {
      if (loan.daysOverdue >= 90) return "bg-red-500/20 text-red-400 border-red-500/30";
      if (loan.daysOverdue >= 60) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
    if (loan.status === "active") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getDaysOverdueBadge = (days) => {
    if (days >= 90) return "bg-red-500 text-white";
    if (days >= 60) return "bg-orange-500 text-white";
    if (days >= 30) return "bg-yellow-500 text-black";
    return "bg-gray-500 text-white";
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount, currency = "USDT") => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ` ${currency}`;
  };

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowDetails(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setShowDetails(false);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const clearAllFilters = () => {
    setStatus("defaulted");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setDaysOverdueMin("");
    setDaysOverdueMax("");
    setIncludeBlocked(false);
    setPage(1);
  };

  const handleExportReport = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
      };

      const params = {};
      if (status !== "defaulted") params.status = status;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (daysOverdueMin) params.daysOverdueMin = daysOverdueMin;
      if (daysOverdueMax) params.daysOverdueMax = daysOverdueMax;
      if (includeBlocked) params.includeBlocked = includeBlocked;

      const response = await axios.get(`${backendUrl}api/expired-loans/admin/expired/export`, {
        ...config,
        params
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expired-loans-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const handleRefresh = () => {
    fetchExpiredLoans();
    fetchExpiredLoanStats();
    toast.info("Data refreshed");
  };

  const getActionButtons = (loan) => {
    const actions = [];

    // Always show view details
    actions.push(
      <button
        key="view"
        onClick={() => handleViewDetails(loan)}
        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
      >
        <Eye size={12} />
        Details
      </button>
    );

    // Send reminder for all defaulted loans
    actions.push(
      <button
        key="reminder"
        onClick={() => sendReminder(loan._id)}
        className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-xs"
      >
        <Mail size={12} />
        Reminder
      </button>
    );

    // Block user for severe defaults
    if (loan.daysOverdue >= 1 && !loan.userId?.isBlocked) {
      actions.push(
        <button
          key="block"
          onClick={() => {
            setSelectedLoan(loan);
            setShowBlockConfirm(true);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
        >
          <Ban size={12} />
          Block
        </button>
      );
    }

    // Unblock user
    if (loan.userId?.isBlocked) {
      actions.push(
        <button
          key="unblock"
          onClick={() => {
            setSelectedLoan(loan);
            setShowUnblockModal(true);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs"
        >
          <Shield size={12} />
          Unblock
        </button>
      );
    }

    return actions;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-lg font-semibold mb-1">Expired Loans Management</h1>
          {/* <p className="text-gray-400 text-sm">Monitor and manage defaulted and overdue loans</p> */}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={runExpiredCheck}
            disabled={processingAction}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm disabled:opacity-50"
          >
            <AlertTriangle size={14} />
            Run Check
          </button>
          {/*
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <Download size={14} />
            Export Report
          </button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {loadingStats ? (
          // Loading skeleton for stats
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-3 border border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-800 rounded mb-2"></div>
              <div className="h-6 bg-gray-800 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">Total Defaulted</div>
              <div className="text-xl font-semibold text-red-400">{stats.count || 0}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">Total Amount</div>
              <div className="text-xl font-semibold text-yellow-400">
                ${stats.totalAmountDefaulted ? stats.totalAmountDefaulted.toLocaleString() : "0"}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">Avg. Days Overdue</div>
              <div className="text-xl font-semibold text-orange-400">{stats.avgDaysOverdue || 0}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">Max Overdue</div>
              <div className="text-xl font-semibold text-red-400">{stats.maxDaysOverdue || 0}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">Blocked Users</div>
              <div className="text-xl font-semibold text-purple-400">{stats.blockedUsers || 0}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-gray-400 text-xs mb-1">Distribution</div>
              <div className="text-xl font-semibold text-blue-400">
                {stats.distribution?.length || 0} ranges
              </div>
            </div>
          </>
        )}
      </div>

      {/* Distribution Chart */}
      {!loadingStats && stats.distribution && stats.distribution.length > 0 && (
        <div className="mb-6 bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">Overdue Distribution</h3>
          <div className="space-y-2">
            {stats.distribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item._id === "365+" ? "bg-red-500" :
                      item._id >= 180 ? "bg-orange-500" :
                        item._id >= 90 ? "bg-yellow-500" :
                          item._id >= 60 ? "bg-blue-500" :
                            item._id >= 30 ? "bg-purple-500" : "bg-gray-500"
                    }`}></div>
                  <span className="text-xs text-gray-400">
                    {item._id === "365+" ? "365+" : `${item._id} days`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white">{item.count} loans</span>
                  <span className="text-xs text-gray-500">
                    ${item.totalAmount ? item.totalAmount.toLocaleString() : "0"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 bg-gray-950 rounded-3xl flex items-center px-3 border border-gray-700">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by loan ID, user name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none p-2 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative w-full lg:w-40">
          <button
            onClick={() => { setOpenStatus(!openStatus); setShowDatePicker(false); }}
            className="w-full bg-gray-900 rounded-lg px-3 py-2 text-left border border-gray-800 flex items-center justify-between text-sm hover:border-gray-600 transition"
          >
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <span className="text-gray-300">{statusLabels[status]}</span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {openStatus && (
            <div className="absolute w-full bg-gray-900 border border-gray-800 rounded-lg mt-1 z-20 text-sm max-h-60 overflow-y-auto">
              {Object.keys(statusLabels).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setOpenStatus(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 text-gray-300 transition flex items-center gap-2"
                >
                  {getStatusIcon({ status: s })}
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Days Overdue Filter */}
        <div className="grid grid-cols-2 gap-2 w-full lg:w-48">
          <input
            type="number"
            placeholder="Min days"
            value={daysOverdueMin}
            onChange={(e) => setDaysOverdueMin(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            min="0"
          />
          <input
            type="number"
            placeholder="Max days"
            value={daysOverdueMax}
            onChange={(e) => setDaysOverdueMax(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            min="0"
          />
        </div>

        {/* Date Picker */}
        <div className="relative w-full lg:w-48">
          <button
            onClick={() => { setShowDatePicker(!showDatePicker); setOpenStatus(false); }}
            className="w-full bg-gray-900 rounded-lg px-3 py-2 text-left border border-gray-800 flex items-center justify-between text-sm hover:border-gray-600 transition"
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-300 text-xs">
                {startDate && endDate
                  ? `${startDate} → ${endDate}`
                  : startDate || endDate
                    ? "Date Set"
                    : "Date Range"}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDatePicker && (
            <div className="absolute w-full bg-gray-900 border border-gray-800 rounded-lg mt-1 z-20 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Date Range</h3>
                  {(startDate || endDate) && (
                    <button
                      onClick={clearDateFilter}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Include Blocked Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <input
            type="checkbox"
            id="includeBlocked"
            checked={includeBlocked}
            onChange={(e) => setIncludeBlocked(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
          />
          <label htmlFor="includeBlocked" className="text-sm text-gray-300">
            Show only blocked
          </label>
        </div>

        {/* Clear All Filters */}
        {(status !== "defaulted" || searchTerm || startDate || endDate || daysOverdueMin || daysOverdueMax || includeBlocked) && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-400 text-sm">
          {loading ? (
            "Loading expired loans..."
          ) : (
            `Showing ${loans.length} of ${totalLoans} loans`
          )}
        </div>
        <div className="text-gray-400 text-sm">
          {!loading && loans.length > 0 && (
            <span>Total Defaulted: ${loans.reduce((sum, loan) => sum + loan.remainingBalance, 0).toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      {loading ? (
        // Loading skeleton
        <div className="hidden lg:block bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-t border-gray-800 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/6"></div>
                <div className="h-4 bg-gray-800 rounded w-1/6"></div>
                <div className="h-4 bg-gray-800 rounded w-1/6"></div>
                <div className="h-4 bg-gray-800 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="p-3 text-left font-medium">Loan ID</th>
                  <th className="p-3 text-left font-medium">User</th>
                  <th className="p-3 text-left font-medium">Amount Due</th>
                  <th className="p-3 text-left font-medium">Days Overdue</th>
                  <th className="p-3 text-left font-medium">Due Date</th>
                  <th className="p-3 text-left font-medium">User Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      No expired loans found
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr
                      key={loan._id}
                      className={`border-t border-gray-800 hover:bg-gray-850 transition ${loan.userId?.isBlocked ? "bg-red-900/20" : ""
                        }`}
                    >
                      <td className="p-3">
                        <div className="text-blue-400 font-mono text-xs">
                          {loan.loanId}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {loan.packageTitle || "N/A"}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {loan.userId?.isBlocked ? (
                            <Ban size={12} className="text-red-500" />
                          ) : (
                            <User size={12} className="text-gray-500" />
                          )}
                          <div>
                            <div className="text-white text-sm">
                              {loan.user?.name || "Unknown"}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {loan.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-red-400 text-sm">
                          ${loan.remainingBalance?.toLocaleString() || "0"}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {loan.currency || "USDT"}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(loan)}
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getDaysOverdueBadge(loan.daysOverdue || 0)}`}>
                            {loan.daysOverdue || 0} days
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-gray-300 text-sm">
                        {formatDate(loan.dueDate)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(loan)}`}>
                            {formatStatus(loan.status)}
                          </span>
                          {loan.userId?.isBlocked && (
                            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getActionButtons(loan)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {loans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No expired loans found
              </div>
            ) : (
              loans.map((loan) => (
                <div
                  key={loan._id}
                  className={`bg-gray-900 rounded-lg p-3 border ${loan.userId?.isBlocked ? "border-red-800 bg-red-900/10" : "border-gray-800"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-blue-400 text-xs font-mono mb-1">{loan.loanId}</div>
                      <div className="text-white text-xs">
                        {loan.user?.name || "Unknown"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {loan.user?.email || "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(loan)}
                      <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(loan)}`}>
                        {formatStatus(loan.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <div className="text-gray-400 text-xs">Amount Due</div>
                      <div className="font-semibold text-red-400">
                        ${loan.remainingBalance?.toLocaleString() || "0"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Days Overdue</div>
                      <div className={`px-2 py-1 text-xs font-semibold rounded inline-block ${getDaysOverdueBadge(loan.daysOverdue || 0)}`}>
                        {loan.daysOverdue || 0} days
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {getActionButtons(loan)}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && loans.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <div className="text-sm mb-2">No expired loans found matching your filters</div>
          <button
            onClick={clearAllFilters}
            className="text-blue-400 hover:text-blue-300 text-sm transition"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Loan Details Modal */}
      {showDetails && selectedLoan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Loan Details</h2>
                <p className="text-gray-400 text-xs mt-1">{selectedLoan.loanId}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-3 text-sm">
                {/* User Info */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">User:</span>
                  <div className="text-right">
                    <div className="text-white">{selectedLoan.user?.name || "Unknown"}</div>

                    {console.log("Selected Loan User:", selectedLoan)}
                    <div className="text-gray-400 text-xs">{selectedLoan.user?.email || "N/A"}</div>
                  </div>
                </div>

                {/* Amount Information */}
                <div className="flex justify-between">
                  <span className="text-gray-400">Requested:</span>
                  <span className="text-green-400">
                    ${selectedLoan.amountRequested?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Approved:</span>
                  <span className="text-blue-400">
                    ${selectedLoan.amountApproved?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Due:</span>
                  <span className="text-red-400 font-semibold">
                    ${selectedLoan.remainingBalance?.toLocaleString() || "0"}
                  </span>
                </div>

                {/* Loan Details */}
                <div className="flex justify-between">
                  <span className="text-gray-400">Package:</span>
                  <span className="text-white">{selectedLoan.packageTitle || "N/A"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Interest Rate:</span>
                  <span className="text-white">{selectedLoan.interestRate || "N/A"}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Repayment Period:</span>
                  <span className="text-white">{selectedLoan.repaymentPeriod || "N/A"} days</span>
                </div>

                {/* Status Information */}
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLoan)}
                    <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(selectedLoan)}`}>
                      {formatStatus(selectedLoan.status)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Days Overdue:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getDaysOverdueBadge(selectedLoan.daysOverdue || 0)}`}>
                    {selectedLoan.daysOverdue || 0} days
                  </span>
                </div>

                {/* Dates */}
                <div className="flex justify-between">
                  <span className="text-gray-400">Application Date:</span>
                  <span className="text-white">{formatDate(selectedLoan.applicationDate)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Due Date:</span>
                  <span className="text-white">{formatDate(selectedLoan.dueDate)}</span>
                </div>

                {selectedLoan.approvalDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Approval Date:</span>
                    <span className="text-white">{formatDate(selectedLoan.approvalDate)}</span>
                  </div>
                )}

                {selectedLoan.disbursementDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Disbursement Date:</span>
                    <span className="text-white">{formatDate(selectedLoan.disbursementDate)}</span>
                  </div>
                )}

                {/* User Status */}
                {selectedLoan.userId?.isBlocked && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">User Status:</span>
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                      Account Blocked
                    </span>
                  </div>
                )}

                {/* Collateral Information */}
                {selectedLoan.collateral && selectedLoan.collateral !== "none" && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="text-gray-400 mb-2">Collateral:</div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-xs">Type:</span>
                      <span className="text-white text-xs capitalize">{selectedLoan.collateral}</span>
                    </div>
                    {selectedLoan.collateralValue && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Value:</span>
                        <span className="text-white text-xs">${selectedLoan.collateralValue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => sendReminder(selectedLoan._id)}
                  className="flex-1 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm font-medium"
                >
                  Send Reminder
                </button>

                {selectedLoan.userId?.isBlocked ? (
                  <button
                    onClick={() => {
                      setShowUnblockModal(true);
                      setShowDetails(false);
                    }}
                    className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                  >
                    Unblock User
                  </button>
                ) : selectedLoan.daysOverdue >= 90 && (
                  <button
                    onClick={() => {
                      setShowBlockConfirm(true);
                      setShowDetails(false);
                    }}
                    className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
                  >
                    Block User
                  </button>
                )}
              </div>

              <button
                onClick={closeModal}
                className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock User Modal */}
      {showUnblockModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-500" />
                <h2 className="text-lg font-semibold text-white">Unblock User</h2>
              </div>
              <button
                onClick={() => setShowUnblockModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />

              <div className="text-center">
                <div className="text-gray-300 mb-2">
                  You are about to unblock <span className="text-white font-semibold">{selectedLoan.userId?.name}</span>
                </div>
                <div className="text-gray-400 text-sm mb-4">
                  This will restore their account access and mark defaulted loans as resolved.
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Loan ID:</span>
                  <span className="text-white">{selectedLoan.loanId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Due:</span>
                  <span className="text-red-400">${selectedLoan.remainingBalance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Overdue:</span>
                  <span className="text-orange-400">{selectedLoan.daysOverdue || 0} days</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Resolution Note</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition h-24 resize-none"
                  placeholder="Explain how the default was resolved..."
                  maxLength={500}
                  required
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {resolutionNote.length}/500 characters
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={unblockUser}
                  disabled={processingAction || !resolutionNote.trim()}
                  className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {processingAction ? "Processing..." : "Confirm Unblock"}
                </button>
                <button
                  onClick={() => setShowUnblockModal(false)}
                  disabled={processingAction}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block User Confirmation Modal */}
      {showBlockConfirm && selectedLoan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Ban size={18} className="text-red-500" />
                <h2 className="text-lg font-semibold text-white">Block User</h2>
              </div>
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />

              <div className="text-center">
                <div className="text-gray-300 mb-2">
                  You are about to block <span className="text-white font-semibold">{selectedLoan.userId?.name}</span>
                </div>
                <div className="text-gray-400 text-sm mb-4">
                  This user has a loan that is {selectedLoan.daysOverdue || 0} days overdue.
                  Blocking will restrict their account access.
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Loan ID:</span>
                  <span className="text-white">{selectedLoan.loanId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Due:</span>
                  <span className="text-red-400">${selectedLoan.remainingBalance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Overdue:</span>
                  <span className="text-red-400">{selectedLoan.daysOverdue || 0} days</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => blockUser(selectedLoan.user._id, selectedLoan._id)}
                  className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                >
                  Confirm Block
                </button>
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
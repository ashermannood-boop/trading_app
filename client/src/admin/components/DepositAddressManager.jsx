import { useState, useEffect } from "react";
import { 
  Search, ChevronDown, RefreshCw, Filter, 
  Plus, Edit, Trash2, Copy, Check, X,
  Bitcoin, Wallet, Layers, AlertCircle,
  DollarSign, Eye, Download
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

export default function CryptoAddressesPanel() {
  const { token, backendUrl } =useAuth();

  // State for addresses data
  const [addresses, setAddresses] = useState({});
  const [filteredAddresses, setFilteredAddresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("All Coins");
  const [openCoinFilter, setOpenCoinFilter] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  
  // Form states
  const [coinName, setCoinName] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [editingCoin, setEditingCoin] = useState(null);
  const [editingNetwork, setEditingNetwork] = useState(null);
  
  // Bulk add states
  const [bulkData, setBulkData] = useState("");
  const [bulkFormat, setBulkFormat] = useState("json");

  // Stats
  const [stats, setStats] = useState({
    totalCoins: 0,
    totalNetworks: 0,
    totalAddresses: 0
  });

  // Get unique coins for filter
  const coinsList = ["All Coins", ...Object.keys(addresses).sort()];

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${backendUrl}api/deposit-addresses/addresses`, config);
      
      const data = response.data.data || {};
      setAddresses(data);
      
      // Apply current filters
      filterAddresses(data, searchTerm, selectedCoin);
      
      // Calculate stats
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load crypto addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from addresses data
  const calculateStats = (data) => {
    const coins = Object.keys(data).length;
    const networks = Object.values(data).reduce(
      (sum, networks) => sum + Object.keys(networks).length, 
      0
    );
    const addresses = Object.values(data).reduce(
      (sum, networks) => sum + Object.values(networks).length,
      0
    );

    setStats({
      totalCoins: coins,
      totalNetworks: networks,
      totalAddresses: addresses
    });
  };

  // Filter addresses based on search and coin filter
  const filterAddresses = (data, search, coin) => {
    let filtered = { ...data };

    // Filter by coin
    if (coin !== "All Coins") {
      filtered = {
        [coin]: filtered[coin] || {}
      };
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const result = {};

      Object.entries(filtered).forEach(([coin, networks]) => {
        const matchingNetworks = {};
        
        Object.entries(networks).forEach(([network, address]) => {
          if (
            coin.toLowerCase().includes(searchLower) ||
            network.toLowerCase().includes(searchLower) ||
            address.toLowerCase().includes(searchLower)
          ) {
            matchingNetworks[network] = address;
          }
        });

        if (Object.keys(matchingNetworks).length > 0) {
          result[coin] = matchingNetworks;
        }
      });

      filtered = result;
    }

    setFilteredAddresses(filtered);
  };

  // Handle search and filter changes
  useEffect(() => {
    filterAddresses(addresses, searchTerm, selectedCoin);
  }, [searchTerm, selectedCoin, addresses]);

  // Initial data fetch
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Copy address to clipboard
  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  // Handle add new address
  const handleAddAddress = async () => {
    if (!coinName || !networkName || !addressValue) {
      toast.error("Please fill all fields");
      return;
    }

    setProcessingAction(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        coin: coinName,
        network: networkName,
        address: addressValue
      };

      await axios.post(`${backendUrl}api/deposit-addresses/addresses`, payload, config);

      toast.success("Address added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error(error.response?.data?.error || "Failed to add address");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle edit address
  const handleEditAddress = async () => {
    if (!editingCoin || !editingNetwork || !addressValue) {
      toast.error("Address cannot be empty");
      return;
    }

    setProcessingAction(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        coin: editingCoin,
        network: editingNetwork,
        address: addressValue
      };

      await axios.put(`${backendUrl}api/deposit-addresses/addresses`, payload, config);

      toast.success("Address updated successfully!");
      setShowEditModal(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error(error.response?.data?.error || "Failed to update address");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle delete address
  const handleDeleteAddress = async () => {
    if (!editingCoin || !editingNetwork) return;

    setProcessingAction(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(
        `${backendUrl}api/deposit-addresses/addresses/${editingCoin}/${editingNetwork}`, 
        config
      );

      toast.success("Address deleted successfully!");
      setShowDeleteModal(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(error.response?.data?.error || "Failed to delete address");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle bulk add
  const handleBulkAdd = async () => {
    if (!bulkData.trim()) {
      toast.error("Please provide data");
      return;
    }

    setProcessingAction(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let payload;
      if (bulkFormat === "json") {
        try {
          payload = JSON.parse(bulkData);
        } catch (e) {
          toast.error("Invalid JSON format");
          return;
        }
      } else {
        // Parse CSV format
        const lines = bulkData.trim().split('\n');
        const addresses = {};
        
        lines.forEach(line => {
          const [coin, network, address] = line.split(',').map(s => s.trim());
          if (coin && network && address) {
            if (!addresses[coin]) addresses[coin] = {};
            addresses[coin][network] = address;
          }
        });
        
        payload = { addresses };
      }

      await axios.post(`${backendUrl}api/deposit-addresses/addresses/bulk`, payload, config);

      toast.success("Bulk addresses added successfully!");
      setShowBulkAddModal(false);
      setBulkData("");
      fetchAddresses();
    } catch (error) {
      console.error("Error in bulk add:", error);
      toast.error(error.response?.data?.error || "Failed to add bulk addresses");
    } finally {
      setProcessingAction(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setCoinName("");
    setNetworkName("");
    setAddressValue("");
    setEditingCoin(null);
    setEditingNetwork(null);
  };

  // Open edit modal
  const openEditModal = (coin, network, address) => {
    setEditingCoin(coin);
    setEditingNetwork(network);
    setAddressValue(address);
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (coin, network) => {
    setEditingCoin(coin);
    setEditingNetwork(network);
    setShowDeleteModal(true);
  };

  // Export addresses
  const exportAddresses = (format = 'json') => {
    try {
      let data, filename, mimeType;
      
      if (format === 'json') {
        data = JSON.stringify(addresses, null, 2);
        filename = `crypto-addresses-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format
        const rows = [];
        rows.push('Coin,Network,Address');
        
        Object.entries(addresses).forEach(([coin, networks]) => {
          Object.entries(networks).forEach(([network, address]) => {
            rows.push(`${coin},${network},${address}`);
          });
        });
        
        data = rows.join('\n');
        filename = `crypto-addresses-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Addresses exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting addresses:", error);
      toast.error("Failed to export addresses");
    }
  };

  // Get coin icon based on name
  const getCoinIcon = (coin) => {
    const coinLower = coin.toLowerCase();
    if (coinLower.includes('btc') || coinLower.includes('bitcoin')) {
      return <Bitcoin className="h-4 w-4 text-orange-400" />;
    } else if (coinLower.includes('eth') || coinLower.includes('ethereum')) {
      return <Wallet className="h-4 w-4 text-blue-400" />;
    } else if (coinLower.includes('usdt') || coinLower.includes('usdc')) {
      return <DollarSign className="h-4 w-4 text-green-400" />;
    } else {
      return <Layers className="h-4 w-4 text-purple-400" />;
    }
  };

  const handleRefresh = () => {
    fetchAddresses();
    toast.info("Addresses refreshed");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold mb-1">Crypto Deposit Addresses</h1>
          <p className="text-gray-400 text-sm">Manage cryptocurrency deposit addresses by coin and network</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          
          <div className="relative">
            <button
              onClick={() => document.getElementById('exportDropdown').classList.toggle('hidden')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              <Download size={14} />
              Export
              <ChevronDown size={14} />
            </button>
            
            <div 
              id="exportDropdown"
              className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-20 hidden"
            >
              <button
                onClick={() => { exportAddresses('json'); document.getElementById('exportDropdown').classList.add('hidden'); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 text-sm"
              >
                JSON
              </button>
              <button
                onClick={() => { exportAddresses('csv'); document.getElementById('exportDropdown').classList.add('hidden'); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 text-sm"
              >
                CSV
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowBulkAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
          >
            <Plus size={14} />
            Bulk Add
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <Plus size={14} />
            Add Address
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Total Coins</div>
          <div className="text-xl font-semibold text-blue-400">{stats.totalCoins}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Total Networks</div>
          <div className="text-xl font-semibold text-purple-400">{stats.totalNetworks}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Total Addresses</div>
          <div className="text-xl font-semibold text-green-400">{stats.totalAddresses}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 bg-gray-900 rounded-lg flex items-center px-3 border border-gray-800">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by coin, network, or address..."
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

        {/* Coin Filter */}
        <div className="relative w-full lg:w-48">
          <button
            onClick={() => setOpenCoinFilter(!openCoinFilter)}
            className="w-full bg-gray-900 rounded-lg px-3 py-2 text-left border border-gray-800 flex items-center justify-between text-sm hover:border-gray-600 transition"
          >
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <span className="text-gray-300">{selectedCoin}</span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {openCoinFilter && (
            <div className="absolute w-full bg-gray-900 border border-gray-800 rounded-lg mt-1 z-20 text-sm max-h-60 overflow-y-auto">
              {coinsList.map((coin) => (
                <button
                  key={coin}
                  onClick={() => {
                    setSelectedCoin(coin);
                    setOpenCoinFilter(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 text-gray-300 transition flex items-center gap-2"
                >
                  {coin !== "All Coins" && getCoinIcon(coin)}
                  {coin}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-400 text-sm">
          {loading ? (
            "Loading addresses..."
          ) : (
            `Showing ${Object.keys(filteredAddresses).length} coins with ${Object.values(filteredAddresses).reduce((sum, n) => sum + Object.keys(n).length, 0)} networks`
          )}
        </div>
      </div>

      {/* Addresses Display */}
      {loading ? (
        // Loading skeleton
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-4 animate-pulse">
              <div className="h-6 bg-gray-800 rounded w-1/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(filteredAddresses).length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-900 rounded-lg border border-gray-800">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-2">No addresses found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-blue-400 hover:text-blue-300 text-sm transition"
              >
                Add your first address
              </button>
            </div>
          ) : (
            Object.entries(filteredAddresses).map(([coin, networks]) => (
              <div key={coin} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                {/* Coin Header */}
                <div className="bg-gray-800/50 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    {getCoinIcon(coin)}
                    <h2 className="font-semibold text-white">{coin}</h2>
                    <span className="text-xs text-gray-400">
                      ({Object.keys(networks).length} networks)
                    </span>
                  </div>
                </div>

                {/* Networks Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800/30 text-gray-400 text-xs">
                      <tr>
                        <th className="p-3 text-left">Network</th>
                        <th className="p-3 text-left">Address</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(networks).map(([network, address]) => (
                        <tr key={`${coin}-${network}`} className="border-t border-gray-800 hover:bg-gray-850 transition">
                          <td className="p-3 font-medium text-white">{network}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 font-mono">
                                {address.slice(0, 20)}...
                                {address.slice(-10)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(address)}
                                className="p-1 text-gray-400 hover:text-white rounded transition"
                                title="Copy full address"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(coin, network, address)}
                                className="p-1 text-blue-400 hover:text-blue-300 transition"
                                title="Edit address"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(coin, network)}
                                className="p-1 text-red-400 hover:text-red-300 transition"
                                title="Delete address"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Add New Address</h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Coin Name</label>
                <input
                  type="text"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g., BTC, ETH, USDT"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Network Name</label>
                <input
                  type="text"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g., Bitcoin, Ethereum, TronTRC20"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Address</label>
                <textarea
                  value={addressValue}
                  onChange={(e) => setAddressValue(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition font-mono h-20 resize-none"
                  placeholder="Enter the deposit address"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddAddress}
                  disabled={processingAction}
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {processingAction ? "Adding..." : "Add Address"}
                </button>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
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

      {/* Edit Address Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit Address</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {editingCoin} - {editingNetwork}
                </p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Address</label>
                <textarea
                  value={addressValue}
                  onChange={(e) => setAddressValue(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition font-mono h-24 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleEditAddress}
                  disabled={processingAction}
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {processingAction ? "Updating..." : "Update Address"}
                </button>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Confirm Delete</h2>
              <button
                onClick={() => { setShowDeleteModal(false); resetForm(); }}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to delete the address for <span className="font-semibold text-white">{editingCoin} - {editingNetwork}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAddress}
                  disabled={processingAction}
                  className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  {processingAction ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); resetForm(); }}
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

      {/* Bulk Add Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Bulk Add Addresses</h2>
              <button
                onClick={() => { setShowBulkAddModal(false); setBulkData(""); }}
                className="p-1 text-gray-400 hover:text-white rounded transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkFormat("json")}
                  className={`px-3 py-1 rounded text-sm ${bulkFormat === "json" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setBulkFormat("csv")}
                  className={`px-3 py-1 rounded text-sm ${bulkFormat === "csv" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  CSV
                </button>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {bulkFormat === "json" ? "JSON Data" : "CSV Data (Coin,Network,Address per line)"}
                </label>
                <textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition font-mono h-48 resize-none"
                  placeholder={bulkFormat === "json" 
                    ? '{\n  "BTC": {\n    "Bitcoin": "address1",\n    "Lightning": "address2"\n  }\n}'
                    : 'BTC,Bitcoin,bc1q...\nETH,Ethereum,0x...\nUSDT,TronTRC20,TR7...'
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleBulkAdd}
                  disabled={processingAction}
                  className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-medium disabled:opacity-50"
                >
                  {processingAction ? "Processing..." : "Add All"}
                </button>
                <button
                  onClick={() => { setShowBulkAddModal(false); setBulkData(""); }}
                  disabled={processingAction}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <div className="text-xs text-gray-500 border-t border-gray-800 pt-3">
                <p className="font-medium mb-1">JSON Format:</p>
                <code className="block bg-gray-800 p-2 rounded">
                  {`{
  "COIN_NAME": {
    "NETWORK_NAME": "ADDRESS",
    "ANOTHER_NETWORK": "ADDRESS"
  }
}`}
                </code>
                <p className="font-medium mt-2 mb-1">CSV Format:</p>
                <code className="block bg-gray-800 p-2 rounded">
                  Coin,Network,Address
                  BTC,Bitcoin,bc1q...
                  ETH,Ethereum,0x...
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
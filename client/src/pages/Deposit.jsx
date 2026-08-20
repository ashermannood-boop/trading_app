import { useState, useRef, useEffect } from "react";
import {
    FaCopy,
    FaUpload,
    FaQrcode,
    FaCheck,
    FaDownload,
    FaSpinner,
    FaExclamationTriangle,
    FaTrash,
    FaImage
} from "react-icons/fa";
import QRCode from "qrcode";
import { ArrowLeft, Wallet, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import MobileNav from "../components/MobileNav";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL + '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const depositService = {
    getDepositAddresses: async () => {
        try {
            const response = await api.get('/deposits/addresses');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    createDeposit: async (depositData, file) => {
        try {
            const formData = new FormData();
            Object.keys(depositData).forEach(key => {
                formData.append(key, depositData[key]);
            });

            if (file) {
                formData.append('proofImage', file);
            }

            const response = await api.post('/deposits/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    }
};

const DEFAULT_DEPOSIT_DATA = {
    BTC: {
        name: "Bitcoin",
        subtitle: "BTC · Bitcoin Network",
        icon: assets.bitcoin,
        networks: { Bitcoin: "Loading...", Lightning: "Loading..." },
    },
    ETH: {
        name: "Ethereum",
        subtitle: "ETH · Ethereum (ERC-20)",
        icon: assets.ethereum,
        networks: { Ethereum: "Loading...", Arbitrum: "Loading..." },
    },
    SOL: {
        name: "Solana",
        subtitle: "SOL · Solana Network",
        icon: assets.solana || assets.bitcoin,
        networks: { Solana: "Loading..." },
    },
    XRP: {
        name: "Ripple",
        subtitle: "XRP · Ripple Network",
        icon: assets.xrp || assets.bitcoin,
        networks: { Ripple: "Loading..." },
    },
    USDT: {
        name: "Tether",
        subtitle: "USDT · TRC-20 / ERC-20",
        icon: assets.tether,
        networks: {
            "Tron (TRC20)": "Loading...",
            "Ethereum (ERC20)": "Loading...",
            "BNB Smart Chain (BEP20)": "Loading..."
        },
    },
    USDC: {
        name: "USD Coin",
        subtitle: "USDC · Multi-Chain",
        icon: assets.usdc || assets.tether,
        networks: {
            "Ethereum (ERC20)": "Loading...",
            "Solana": "Loading...",
            "BNB Smart Chain (BEP20)": "Loading..."
        },
    }
};

export default function Deposit() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchDepositAddresses();
        checkAccountVerification();
    }, []);

    const [coin, setCoin] = useState("BTC");
    const [network, setNetwork] = useState("Bitcoin");
    const [amount, setAmount] = useState("");
    const [transactionHash, setTransactionHash] = useState("");
    const [fromAddress, setFromAddress] = useState("");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingAddresses, setFetchingAddresses] = useState(true);
    const [accountVerified, setAccountVerified] = useState(true);
    const [depositAddresses, setDepositAddresses] = useState(DEFAULT_DEPOSIT_DATA);
    
    const fileInputRef = useRef(null);
    const qrCanvasRef = useRef(null);
    const navigate = useNavigate();

    const currentCoin = depositAddresses[coin];
    const address = currentCoin?.networks?.[network] || "Loading...";

    const checkAccountVerification = () => {
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        setAccountVerified(user.isAccountVerified ?? true);
    };

    const fetchDepositAddresses = async () => {
        try {
            setFetchingAddresses(true);
            const response = await depositService.getDepositAddresses();
            if (response.success && response.data) {
                setDepositAddresses(prev => {
                    const updated = { ...prev };
                    Object.keys(response.data).forEach(currency => {
                        if (updated[currency]) {
                            updated[currency].networks = response.data[currency];
                        }
                    });
                    return updated;
                });

                if (response.data[coin]) {
                    const firstNetwork = Object.keys(response.data[coin])[0];
                    if (firstNetwork) {
                        setNetwork(firstNetwork);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch deposit addresses:', error);
            toast.error(error.message || 'Failed to load deposit addresses');
        } finally {
            setFetchingAddresses(false);
        }
    };

    const generateQRCode = async () => {
        if (!showQR && address && address !== "Loading...") {
            setShowQR(true);
            setTimeout(() => {
                generateQR();
            }, 100);
        } else {
            setShowQR(false);
        }
    };

    const generateQR = async () => {
        if (!qrCanvasRef.current || !address || address === "Loading...") return;

        setGeneratingQR(true);
        try {
            await QRCode.toCanvas(qrCanvasRef.current, address, {
                width: 180,
                height: 180,
                margin: 2,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error('Error generating QR code:', err);
            toast.error('Failed to generate QR code');
        } finally {
            setGeneratingQR(false);
        }
    };

    const downloadQRCode = async () => {
        try {
            const canvas = qrCanvasRef.current;
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${coin}-${network}-address.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success('QR code downloaded successfully');
        } catch (err) {
            console.error('Error downloading QR code:', err);
            toast.error('Failed to download QR code');
        }
    };

    const handleCopyAddress = async () => {
        if (!address || address === "Loading...") {
            toast.error('Address not available');
            return;
        }

        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success('Address copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy address');
        }
    };

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
            if (!validTypes.includes(uploadedFile.type)) {
                toast.error('Please upload a valid file (JPEG, PNG, WebP, or PDF)');
                return;
            }
            if (uploadedFile.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setFile(uploadedFile);
            
            if (uploadedFile.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(uploadedFile));
            } else {
                setPreviewUrl(null);
            }

            toast.success('File uploaded successfully');
        }
    };

    const removeFile = (e) => {
        e.stopPropagation();
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info('File removed');
    };

    const validateForm = () => {
        const errors = [];

        if (!amount || parseFloat(amount) <= 0) {
            errors.push('Please enter a valid amount');
        }

        if (!file) {
            errors.push('Please upload deposit payment proof image');
        }

        const minAmounts = {
            'BTC': 0.0001,
            'ETH': 0.001,
            'SOL': 0.05,
            'XRP': 5,
            'USDT': 10,
            'USDC': 10
        };

        const amountNum = parseFloat(amount);
        const minAmount = minAmounts[coin] || 1;
        if (amountNum < minAmount) {
            errors.push(`Minimum deposit for ${coin} is ${minAmount}`);
        }

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }

        if (!accountVerified) {
            toast.error('Account verification required. Please verify your email first.');
            navigate('/verify');
            return;
        }

        try {
            setLoading(true);

            const depositData = {
                currency: coin,
                network: network,
                amount: parseFloat(amount),
                txHash: transactionHash.trim() || 'Pending verification',
                toAddress: address,
                fromAddress: fromAddress.trim() || 'Unknown',
                note: `Deposit ${amount} ${coin} via ${network}`
            };

            const response = await depositService.createDeposit(depositData, file);

            if (response.success) {
                toast.success(
                    <div>
                        <div className="font-bold text-sm sm:text-base">Deposit Submitted successfully!</div>
                        <div className="text-xs mt-1 text-gray-300">Please wait for admin approval</div>
                    </div>,
                    { autoClose: 7000 }
                );

                setAmount("");
                setTransactionHash("");
                setFromAddress("");
                setFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                toast.error(response?.message || 'Failed to submit deposit. Please try again.');
            }
        } catch (error) {
            console.error('Deposit submission error:', error);
            toast.error(error.message || 'Failed to submit deposit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNetworkChange = (newNetwork) => {
        setNetwork(newNetwork);
        setShowQR(false);
    };

    const handleCoinChange = (newCoin) => {
        setCoin(newCoin);
        const networks = depositAddresses[newCoin]?.networks;
        if (networks && Object.keys(networks).length > 0) {
            setNetwork(Object.keys(networks)[0]);
        }
        setShowQR(false);
    };

    return (
        <div className="min-h-screen bg-[#070a12] text-gray-100 py-4 sm:py-8 px-3 sm:px-6 mb-20 relative overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-0 w-[200px] sm:w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <MobileNav />

            <div className="w-full max-w-full sm:max-w-xl lg:max-w-2xl mx-auto relative z-10">
                <div
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 group cursor-pointer mb-5 text-gray-400 hover:text-white transition-all"
                >
                    <div className="p-2 rounded-xl bg-gray-900/80 border border-gray-800/80 group-hover:border-gray-700 group-hover:bg-gray-800/60 transition-all">
                        <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </div>

                {!accountVerified && (
                    <div className="mb-5 p-3.5 sm:p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-500/20 rounded-xl text-red-400 flex-shrink-0">
                                <FaExclamationTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-red-400 mb-0.5">Account Unverified</h3>
                                <p className="text-red-300/80 text-xs leading-relaxed">
                                    Please verify your email to unlock instant deposit approvals.
                                    <button
                                        onClick={() => navigate('/verify')}
                                        className="ml-2 font-medium text-red-300 underline hover:text-white transition-colors"
                                    >
                                        Verify Email
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900/90 border border-gray-800 p-6 sm:p-8 rounded-3xl flex flex-col items-center max-w-xs w-full text-center shadow-2xl">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                                <FaSpinner className="animate-spin text-4xl text-blue-500 relative z-10" />
                            </div>
                            <p className="text-white font-semibold text-base sm:text-lg">Processing Deposit</p>
                            <p className="text-gray-400 text-xs mt-1">Please keep this tab open while we securely process your request.</p>
                        </div>
                    </div>
                )}

                <div className="bg-[#0e1424]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-800/80 p-4 sm:p-7 md:p-9 shadow-2xl">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Fund Your Account</h1>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1.5">Select your preferred asset and follow the transfer instructions.</p>
                    </div>

                    {/* Asset Selector */}
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                            1. Select Deposit Asset
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {Object.entries(depositAddresses).map(([key, data]) => {
                                const isSelected = coin === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleCoinChange(key)}
                                        disabled={fetchingAddresses || loading}
                                        className={`group relative flex items-center p-3 rounded-2xl border transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isSelected
                                                ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border-blue-500/80 shadow-lg shadow-blue-500/10"
                                                : "bg-[#090e1a]/80 border-gray-800/80 hover:border-gray-700 hover:bg-[#0c1322]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gray-900/80 flex-shrink-0 overflow-hidden border border-gray-800">
                                                <img
                                                    src={data.icon}
                                                    alt={data.name || key}
                                                    className="w-full h-full object-cover p-1.5"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-white font-semibold text-sm truncate">
                                                        {data.name || key}
                                                    </h4>
                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 ml-1">
                                                            <FaCheck className="text-[9px] text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-xs font-medium truncate mt-0.5">
                                                    {data.subtitle || `${key} Network`}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Network Selector */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                            2. Choose Deposit Network
                        </label>
                        <div className="relative">
                            <select
                                value={network}
                                onChange={(e) => handleNetworkChange(e.target.value)}
                                className="w-full bg-[#090e1a] border border-gray-800 rounded-xl p-3 text-base sm:text-sm text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50 outline-none appearance-none cursor-pointer"
                                disabled={fetchingAddresses || loading || !currentCoin?.networks}
                            >
                                {currentCoin?.networks && Object.keys(currentCoin.networks).map((net) => (
                                    <option key={net} value={net} className="bg-gray-900 text-white">
                                        {net}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Address & QR Code */}
                    <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-[#090e1a] border border-gray-800/80">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                                Deposit Address
                            </label>
                            <button
                                type="button"
                                onClick={generateQRCode}
                                disabled={!address || address === "Loading..." || fetchingAddresses || loading}
                                className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <FaQrcode className="text-xs" />
                                {showQR ? 'Hide QR' : 'Display QR'}
                            </button>
                        </div>

                        {showQR ? (
                            <div className="bg-[#050811] p-4 sm:p-5 rounded-xl flex flex-col items-center justify-center border border-gray-800/80 mt-3">
                                {generatingQR ? (
                                    <div className="w-40 h-40 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white rounded-2xl shadow-xl">
                                            <canvas ref={qrCanvasRef} className="rounded-lg" />
                                        </div>
                                        <p className="text-gray-300 mt-3 text-center font-mono text-xs break-all max-w-xs bg-gray-900/60 p-2 rounded-lg border border-gray-800 select-all">
                                            {address}
                                        </p>
                                        <div className="flex gap-2.5 mt-3 w-full justify-center">
                                            <button
                                                type="button"
                                                onClick={downloadQRCode}
                                                disabled={loading}
                                                className="flex-1 max-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all text-xs disabled:opacity-50"
                                            >
                                                <FaDownload className="text-xs" />
                                                Save Image
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCopyAddress}
                                                disabled={loading}
                                                className="flex-1 max-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all text-xs disabled:opacity-50 border border-gray-700"
                                            >
                                                <FaCopy className="text-xs" />
                                                Copy
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center bg-[#050811] border border-gray-800/80 rounded-xl p-2.5 group hover:border-gray-700 transition-all mt-1">
                                <p className="flex-1 text-xs font-mono text-gray-300 truncate px-2 select-all">
                                    {address}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCopyAddress}
                                    disabled={!address || address === "Loading..." || fetchingAddresses || loading}
                                    className="p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all flex-shrink-0 disabled:opacity-50 border border-blue-500/20"
                                >
                                    {copied ? (
                                        <FaCheck className="text-green-400 text-xs" />
                                    ) : (
                                        <FaCopy className="text-xs" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Amount Input */}
                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Amount Transferred
                            </label>
                            <span className="text-[10px] text-gray-400">
                                Min: {
                                    coin === 'BTC' ? '0.0001 BTC' :
                                    coin === 'ETH' ? '0.001 ETH' :
                                    coin === 'SOL' ? '0.05 SOL' :
                                    coin === 'XRP' ? '5 XRP' :
                                    coin === 'USDT' ? '10 USDT' :
                                    coin === 'USDC' ? '10 USDC' : '1'
                                }
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full bg-[#090e1a] border border-gray-800 rounded-xl p-3 pr-16 text-base sm:text-sm text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50 outline-none"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                                min="0"
                                step="0.00000001"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{coin}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Proof Image Upload */}
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                            Upload Proof of Payment *
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                            className="hidden"
                            disabled={loading}
                        />

                        {!file ? (
                            <div
                                onClick={() => !loading && fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-800 hover:border-blue-500/50 bg-[#090e1a] hover:bg-[#0c1322] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                            >
                                <div className="p-3 bg-blue-600/10 text-blue-400 group-hover:text-white group-hover:bg-blue-600 rounded-xl mb-2 transition-all">
                                    <FaUpload className="text-lg" />
                                </div>
                                <p className="text-sm font-semibold text-gray-200">Click to upload transaction screenshot</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, or PDF up to 10MB</p>
                            </div>
                        ) : (
                            <div className="bg-[#090e1a] border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Proof preview"
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-700 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-blue-400 flex-shrink-0">
                                            <FaImage className="text-xl" />
                                        </div>
                                    )}ss
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    disabled={loading}
                                    className="p-2 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700/80 rounded-xl transition-all flex-shrink-0"
                                >
                                    <FaTrash className="text-xs" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || fetchingAddresses}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin text-sm" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Deposit'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import MobileNav from "../components/MobileNav";
import Loading from "../components/Loading";
import ProfileEditModal from "../components/ProfileEditModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

// Icons
import {
  // Navigation
  ChevronLeft,
  LogOut,

  // Actions
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeDollarSign,
  Clock4,

  // Settings
  User,
  Key,
  IdCard,
  Shield,
  HelpCircle,
  Bell,
  CreditCard,

  // KYC Status
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,

  // UI
  Eye,
  EyeOff,
  ChevronRight,
  Camera,
  Mail,
  Calendar,
  Copy,
  ExternalLink,
  X,

} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { backendUrl, token, logout } = useAuth();


  // State
  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

 const [isPasswordSet,setIsPasswordSet] = useState(true)

  const [profileForm, setProfileForm] = useState({
    name: "",
    userName: "",
    avatar: ""
  });

  // UI states
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Fetch profile data
  const fetchProfile = async (showToast = false) => {
    try {
      if (!showToast) setLoading(true);
      else setRefreshing(true);

      const res = await axios.get(`${backendUrl}api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      //   console.log({data:res.data})

      if (res.data.success) {
        setUserdata(res.data.user);
        // Initialize profile form with user data
        setProfileForm({
          name: res.data.user.name || "",
          userName: res.data.user.userName || "",
          avatar: res.data.user.avatar || ""
        });

       /// console.log(res.data.user.isPasswordSet)

        setIsPasswordSet(res.data.user.isPasswordSet)
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Password validation
  const validatePassword = () => {
    const errors = {};

    if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain at least one number";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setUpdatingPassword(true);
      const response = await axios.post(
        `${backendUrl}api/profile/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Password changed successfully");
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordErrors({});
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Profile update handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.put(
        `${backendUrl}api/profile/profile`,
        profileForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setShowProfileEdit(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get KYC status badge
  const getKYCStatusBadge = (status) => {
    const statuses = {
      'approved': {
        icon: <CheckCircle size={16} className="text-green-500" />,
        text: "Verified",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        action: null
      },
      'under_review': {
        icon: <Clock size={16} className="text-blue-500" />,
        text: "Under Review",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        action: null
      },
      'pending': {
        icon: <Clock size={16} className="text-yellow-500" />,
        text: "Pending",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        action: null
      },
      'rejected': {
        icon: <XCircle size={16} className="text-red-500" />,
        text: "Rejected",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        action: "Resubmit"
      },
      'not_submitted': {
        icon: <AlertCircle size={16} className="text-gray-500" />,
        text: "Not Verified",
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        action: "Verify Now"
      }
    };
    return statuses[status] || statuses['not_submitted'];
  };

  // Handle KYC navigation
  const handleKYCAction = () => {
    navigate('/');
  };

  if (loading) {
    return <Loading text="Loading profile..." fullScreen />;
  }

  if (!userdata) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load profile</h2>
          <p className="text-gray-400 mb-4">Please try again</p>
          <button
            onClick={() => fetchProfile()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  console.log("User data:", userdata);
  const kycStatus = getKYCStatusBadge(userdata.kycStatus);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <MobileNav />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 ">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchProfile(true)}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-1 sm:px-4 py-8">
        <div className="space-y-6">



          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl sm:border sm:border-gray-700 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    {userdata.avatar ? (
                      <img
                        src={userdata.avatar}
                        alt={userdata.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-white">
                        {userdata.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full border-2 border-gray-900 transition-colors"
                >
                  <Camera size={14} className="text-white" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {userdata.name}
                  </h1>
                  {userdata.userName && (
                    <span className="text-gray-400">@{userdata.userName}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* KYC Status Badge - Clickable if action available */}
                  <button
                    onClick={kycStatus.action ? handleKYCAction : undefined}
                    disabled={!kycStatus.action}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${kycStatus.bgColor} ${kycStatus.borderColor} border transition-all ${kycStatus.action ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                      }`}
                  >
                    {kycStatus.icon}
                    <span className={`text-xs font-medium ${kycStatus.color}`}>
                      KYC: {kycStatus.text}
                    </span>
                    {kycStatus.action && (
                      <span className="text-xs underline ml-1">{kycStatus.action}</span>
                    )}
                  </button>

                  {/* Account Status */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                    <Shield size={14} className="text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">
                      {userdata.role === 'admin' ? 'Admin' : 'Verified Account'}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                  <Mail size={14} />
                  <span>{userdata.email}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userdata.email);
                      toast.success('Email copied to clipboard');
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                  <Calendar size={14} />
                  <span>Member since {formatDate(userdata.createdAt)}</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setShowProfileEdit(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <User size={16} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Rejection Reason - Only show if rejected */}
            {userdata.kycStatus === 'rejected' && userdata.kycRejectionReason && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-500">KYC Verification Failed</p>
                    <p className="text-xs text-red-400 mt-1">{userdata.kycRejectionReason}</p>
                    <button
                      onClick={() => navigate('/kyc')}
                      className="text-xs text-red-400 hover:text-red-300 underline mt-2"
                    >
                      Resubmit Documents
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-3 smp-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ActionButton
                icon={<ArrowDownCircle size={20} />}
                label="Deposit"
                color="text-blue-400"
                onClick={() => navigate('/deposit')}
              />
              <ActionButton
                icon={<ArrowUpCircle size={20} />}
                label="Withdraw"
                color="text-green-400"
                onClick={() => navigate('/withdraw')}
              />
              <ActionButton
                icon={<BadgeDollarSign size={20} />}
                label="Loan"
                color="text-purple-400"
                onClick={() => navigate('/loan')}
              />
              <ActionButton
                icon={<Clock4 size={20} />}
                label="History"
                color="text-gray-400"
                onClick={() => navigate('/history')}
              />
            </div>
          </div>

          {/* Security & Settings */}
          <div className="bg-gray-900 rounded-2xl sm:border sm:border-gray-700 p-2 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Security & Settings</h2>
            <div className="space-y-2">
              {/* KYC Verification - Always show, clickable based on status */}
              <SettingItem
                icon={<IdCard size={18} />}
                label="KYC Verification"
                description={getKYCStatusDescription(userdata.kycStatus)}
                status={userdata.kycStatus}
                statusText={kycStatus.text}
                statusColor={kycStatus.color}
                onClick={() => navigate('/kyc')}
                showChevron={userdata.kycStatus !== 'approved' && userdata.kycStatus !== 'pending' && userdata.kycStatus !== 'under_review'}
              />

              <SettingItem
                icon={<Key size={18} />}
                label= {isPasswordSet ? "Change Password" : 'Set password'}
                description={isPasswordSet ? "Update your password regularly" : 'You are currently using social login. Set a password for added security and to enable password login.'}
                onClick={() => setShowChangePassword(true)}
              />


              <SettingItem
                icon={<HelpCircle size={18} />}
                label="Help & Support"
                description="Get help with your account"
                onClick={() => {
                  if (window.Tawk_API) {
                    window.Tawk_API.showWidget();
                    window.Tawk_API.maximize();
                  }
                }}
              />

              <SettingItem
                icon={<LogOut size={18} />}
                label="Sign Out"
                description="Logout from your account"
                danger
                onClick={handleLogout}
              />
            </div>
          </div>

          {/* Account Info - Optional */}
          <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Account ID</h3>
                <p className="text-sm text-white font-mono mt-1">{userdata._id}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userdata._id);
                  toast.success('Account ID copied');
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>


      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
        passwordErrors ={passwordErrors }
        setShowChangePassword={setShowChangePassword}
        handlePasswordChange={handlePasswordChange}
        setPasswordData={setPasswordData}
        passwordData={passwordData}
        updatingPassword={updatingPassword}
        isPasswordSet={isPasswordSet}
        setIsPasswordSet={setIsPasswordSet}
        setPasswordErrors={setPasswordErrors}
        />
      )}





      {/* Edit Profile Modal */}
      {showProfileEdit && (
        <ProfileEditModal
          handleProfileUpdate={handleProfileUpdate}
          setShowProfileEdit={setShowProfileEdit}
          setProfileForm={setProfileForm}
          loading={Loading}
          profileForm={profileForm}
          userdata={userdata}
          setPasswordErrors ={setPasswordErrors}
        />

      )}

    </div>
  );
}

// ============= Helper Components =============

// Action Button Component
function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-4 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-500 transition-all group"
    >
      <div className={`mb-2 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </button>
  );
}

// Setting Item Component
function SettingItem({ icon, label, description, status, statusText, statusColor, danger = false, onClick, showChevron = true }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-gray-700/50 border border-transparent hover:border-gray-600 ${danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300'
        }`}
    >
      <div className={danger ? 'text-red-500' : status ? statusColor : 'text-gray-400'}>
        {icon}
      </div>

      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{label}</span>
          {status && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor} bg-opacity-10 border border-current`}>
              {statusText}
            </span>
          )}
        </div>
        <div className="text-gray-500 text-xs mt-0.5">{description}</div>
      </div>

      {showChevron && <ChevronRight size={16} className="text-gray-500" />}
    </button>
  );
}

// Helper function for KYC status description
function getKYCStatusDescription(status) {
  switch (status) {
    case 'approved':
      return 'Your identity has been verified';
    case 'under_review':
      return 'Your documents are being reviewed';
    case 'pending':
      return 'Verification in progress';
    case 'rejected':
      return 'Resubmit your documents';
    default:
      return 'Verify your identity to unlock all features';
  }
}
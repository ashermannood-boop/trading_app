import React from 'react'
import {
    Eye,
    EyeOff,
    X,
    Lock

} from "lucide-react";
import { useState } from 'react';

const ChangePasswordModal = ({
    setShowChangePassword,
    handlePasswordChange,
    setPasswordData,
    passwordData,
    updatingPassword,
    passwordErrors,
    setPasswordErrors,
    isPasswordSet,
    setIsPasswordSet
}) => {
    const togglePassword = () => setShowPassword(!showPassword);
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex sm:items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setShowChangePassword(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="sm:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full sm:border sm:border-gray-800 max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white tracking-wide">
                       { isPasswordSet ? 'Change Password' :'Set Password'}
                    </h3>

                    <button
                        onClick={() => {
                            setShowChangePassword(false);
                            setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                            });
                            setPasswordErrors({});
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handlePasswordChange}
                    className="px-2 sm:px-5 py-5 space-y-5 overflow-y-auto"
                >
                    {/* Current Password */}
                   {isPasswordSet &&
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium ">
                            Current Password
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-10 pr-10 py-3 mt-2  bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                                placeholder="••••••••"
                                required
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value,
                                    })
                                }
                                //placeholder="Enter current password"
                                autoComplete="password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={togglePassword}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} className="text-gray-500 hover:text-gray-300" />
                                ) : (
                                    <Eye size={18} className="text-gray-500 hover:text-gray-300" />
                                )}
                            </button>
                        </div>
                    </div>
                    }

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium ">
                             { isPasswordSet ? 'New Password' :'Password'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`w-full pl-10 pr-10 py-3 mt-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${passwordErrors.newPassword
                                    ? "border-red-500"
                                    : "border-gray-700"
                                    }`}
                                required
                                //placeholder="Enter current password"
                                autoComplete="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value,
                                    })
                                }
                                placeholder="Enter password"



                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={togglePassword}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} className="text-gray-500 hover:text-gray-300" />
                                ) : (
                                    <Eye size={18} className="text-gray-500 hover:text-gray-300" />
                                )}
                            </button>
                        </div>
                        {passwordErrors.newPassword && (
                            <p className="text-xs text-red-500">
                                {passwordErrors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium ">
                             { isPasswordSet ? 'Confirm New Password' :'Confirm Password'}
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`w-full pl-10 pr-10 py-3 mt-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${passwordErrors.confirmPassword
                                    ? "border-red-500"
                                    : "border-gray-700"
                                    }`}
                                required
                                //placeholder="Enter current password"
                                autoComplete="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                placeholder="Confirm password"

                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={togglePassword}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} className="text-gray-500 hover:text-gray-300" />
                                ) : (
                                    <Eye size={18} className="text-gray-500 hover:text-gray-300" />
                                )}
                            </button>
                        </div>

                        {passwordErrors.confirmPassword && (
                            <p className="text-xs text-red-500">
                                {passwordErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Password Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs text-blue-400 leading-relaxed">
                            Password must contain at least 8 characters, one uppercase letter, and one number.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowChangePassword(false)}
                            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={updatingPassword}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {updatingPassword ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (

                                isPasswordSet ? 'Update Password' :'Set Password'
                                
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChangePasswordModal

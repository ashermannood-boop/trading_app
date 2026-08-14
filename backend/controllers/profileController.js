import userModel from "../models/usermodel.js";
import bcrypt from "bcryptjs";

// Get user profile with KYC status
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select(
      "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Format response to include only necessary KYC info
    const profileData = {
      _id: user._id,
      name: user.name,
      userName: user.userName,
      isPasswordSet: user.isPasswordSet,
      email: user.email,
      avatar: user.avatar,
      isAccountVerified: user.isAccountVerified,
      kycStatus: user.kycStatus,
      isKyc: user.isKyc,
      // Only include KYC details if approved or if user is viewing their own profile
      kycDetails: user.kyc ? {
        fullName: user.kyc.fullName,
        idType: user.kyc.idType,
        submittedAt: user.kyc.submittedAt,
        // Don't send sensitive ID number or image paths by default
        // You can control this based on requirements
      } : null,
      kycRejectionReason: user.kycRejectionReason || null,
      kycSubmittedAt: user.kyc?.submittedAt || null,
      kycVerifiedAt: user.kycVerifiedAt || null,
      wallet: user.wallet || {
        usdt: 0,
        btc: 0,
        eth: 0,
        loanUsdt: 0
      },
      loanUsdt: user.loanUsdt || 0,
      loanStatus: user.loanStatus || "no_active_loan",
      role: user.role,
      totalTrades: user.totalTrades || 0,
      totalProfit: user.totalProfit || 0,
      totalLoss: user.totalLoss || 0,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      success: true,
      user: profileData
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

// Update profile (basic info)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, userName, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (userName) updateData.userName = userName;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("+password isPasswordSet");
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isPasswordSet) {
      const { currentPassword, newPassword } = req.body;
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required"
        });
      }

      // Password strength validation
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long"
        });
      }

      // Get user with password
      const user = await userModel.findById(userId).select("+password");


      // Check if user has a password (might be OAuth user)
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "This account doesn't have a password. Please use social login or set up a password first."
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as current password"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });

    } else {
      const { newPassword } = req.body;
      // Validate input
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "Password is required"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      user.isPasswordSet = true; 
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });


    }

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message
    });
  }
};

// Get KYC status only
export const getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("kycStatus isKyc kyc.submittedAt kycRejectionReason");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      kycStatus: user.kycStatus,
      isKyc: user.isKyc,
      submittedAt: user.kyc?.submittedAt || null,
      rejectionReason: user.kycRejectionReason || null,
      // Add estimated verification time
      estimatedTime: user.kycStatus === "pending" || user.kycStatus === "under_review" ? "24-48 hours" : null
    });
  } catch (error) {
    console.error("Get KYC status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
      error: error.message
    });
  }
};

// Request account deletion
export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Soft delete - mark as deleted but keep data
    user.deletedAt = new Date();
    user.deletedBy = userId;
    user.isBlocked = true; // Prevent further actions

    if (reason) {
      user.deletionReason = reason; // You might want to add this field to schema
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account deletion requested successfully"
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to request account deletion",
      error: error.message
    });
  }
};
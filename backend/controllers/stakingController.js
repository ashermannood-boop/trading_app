import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import StakingPosition from "../models/StakingPosition.js";
import StakingRewardLog from "../models/StakingRewardLog.js";

// ==========================================
// USER CONTROLLERS
// ==========================================

// 1. Create a New Staking Position
export const createStake = async (req, res) => {
  const { asset, amount } = req.body;
  const validAssets = ["USDT", "BTC", "ETH"]; // Example supported assets
  console.log("Received staking request:", { asset, amount });
  const session = await mongoose.startSession();
  session.startTransaction();


  try {
    const userId = req.user._id; // Assumes auth middleware populates req.user
    const { asset, amount } = req.body; // e.g., asset: 'USDT', amount: 100
    console.log('log 0')

    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return res.json({ success: false, message: "Invalid staking amount" });
    }


    const assetKey = asset.toLowerCase();
    const user = await userModel.findById(userId)
  
    if (!user || user.isBlocked) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Account restricted" });
    }
    // Check user wallet balance
    if ((user.wallet[assetKey] || 0) < amount) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Insufficient ${asset.toUpperCase()} balance` });
    }

    // Deduct balance from user wallet
    user.wallet[assetKey] -= amount;
    await user.save();

    console.log('log 2')
    // Create standalone staking document
    const position = await StakingPosition.create(
      [
        {
          userId,
          asset: asset.toUpperCase(),
          stakedAmount: amount,
          apy: 0.034, // 3.4% APY default
          status: "active",
        },
      ],
      {  }
    );

    //await session.commitTransaction();
    return res.status(201).json({
      success: true,
      message: "Assets staked successfully",
      data: position[0],
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// 2. Unstake / Redeem Assets

export const unstakeAsset = async (req, res) => {


  try {
    const userId = req.user._id;
    const { positionId } = req.params;

    // 1. Find active position attached to session
    const position = await StakingPosition.findOne({
      _id: positionId,
      userId,
      status: "active",
    })

    if (!position) {
   
      return res.status(404).json({ success: false, message: "Active position not found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      //await session.abortTransaction();
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const assetKey = position.asset.toLowerCase();
    const totalReturn = position.stakedAmount + position.accumulatedYield;

    // 2. Return principal + accumulated yield back to user wallet
    user.wallet[assetKey] = (user.wallet[assetKey] || 0) + totalReturn;
    await user.save();

    // 3. Remove/Delete the position directly from the database
    await StakingPosition.findByIdAndDelete(positionId);


    

    return res.status(200).json({
      success: true,
      message: `Successfully unstaked and closed position. Returned ${totalReturn.toFixed(4)} ${position.asset} to wallet.`,
    });
  } catch (error) {
   
    console.error("Unstake Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
   
  }
};

// 3. User Dashboard Summary & Yield History
export const getUserStakingDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const positions = await StakingPosition.find({ userId }).sort({ createdAt: -1 });
    const rewardLogs = await StakingRewardLog.find({ userId }).sort({ createdAt: -1 }).limit(20);

    const activePositions = positions.filter((p) => p.status === "active");
    const totalStakedUsdt = activePositions.reduce((acc, p) => acc + p.stakedAmount, 0);
    const totalEarnedUsdt = positions.reduce((acc, p) => acc + p.accumulatedYield, 0);

    // Calculate daily reward preview based on 3.4% APY: (1 + APY)^(1/365) - 1
    const dailyRate = Math.pow(1 + 0.034, 1 / 365) - 1;
    const estimatedDailyYield = totalStakedUsdt * dailyRate;

    return res.status(200).json({
      success: true,
      summary: {
        totalStakedUsdt,
        totalEarnedUsdt,
        estimatedDailyYield,
        apy: 0.034,
      },
      positions,
      recentPayouts: rewardLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

// 4. Admin Overview (Global Staking Metrics)

/**
 * @desc    Get Admin Staking Dashboard Overview & User Positions
 * @route   GET /api/staking/admin/overview
 * @access  Private/Admin
 */
export const getAdminStakingOverview = async (req, res) => {
  try {
    const stats = await StakingPosition.aggregate([
      {
        $group: {
          _id: null,
          totalActiveStaked: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, "$stakedAmount", 0],
            },
          },
          totalRewardsPaidOut: {
            $sum: "$accumulatedYield",
          },
          totalActivePositions: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const metrics = stats[0] || {
      totalActiveStaked: 0,
      totalRewardsPaidOut: 0,
      totalActivePositions: 0,
    };

    const positions = await StakingPosition.find()
      .populate("userId", "name email wallet")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      metrics,
      positions,
    });
  } catch (error) {
    console.error("Admin Staking Overview Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve admin staking overview",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin: Update APY for a specific position
 * @route   PATCH /api/staking/admin/update-apy/:positionId
 * @access  Private/Admin
 */
export const updatePositionApy = async (req, res) => {
  try {
    const { positionId } = req.params;
    const { newApy } = req.body;

    if (newApy === undefined || newApy < 0) {
      return res.status(400).json({ success: false, message: "Valid APY rate is required" });
    }

    const position = await StakingPosition.findByIdAndUpdate(
      positionId,
      { apy: parseFloat(newApy) },
      { new: true }
    );

    if (!position) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }

    return res.status(200).json({
      success: true,
      message: "APY rate updated successfully",
      position,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Force Close / Unstake a position
 * @route   POST /api/staking/admin/force-close/:positionId
 * @access  Private/Admin
 */
export const forceClosePosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const position = await StakingPosition.findById(positionId);

    if (!position) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }

    if (position.status !== "active") {
      return res.status(400).json({ success: false, message: "Position is already closed" });
    }

    position.status = "closed";
    position.closedAt = new Date();
    await position.save();

    return res.status(200).json({
      success: true,
      message: "Position closed and funds refunded to user",
      position,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ensure your existing controllers (createStake, unstakeAsset, getUserStakingDashboard) 
// are also exported using `export const createStake = ...`, etc.
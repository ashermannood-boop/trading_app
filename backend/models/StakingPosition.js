import mongoose from "mongoose";

const stakingPositionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true, // Speeds up queries when fetching a user's stakes
    },
    asset: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["USDT", "BTC", "ETH"], // Expand as needed
    },
    stakedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    apy: {
      type: Number,
      default: 0.034, // 3.4% APY
    },
    accumulatedYield: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "unstaking", "closed"],
      default: "active",
      index: true, // Speeds up the daily cron job filter
    },
    lastYieldAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const StakingPosition =
  mongoose.models.StakingPosition ||
  mongoose.model("StakingPosition", stakingPositionSchema);

export default StakingPosition;
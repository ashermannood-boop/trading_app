import mongoose from "mongoose";

const stakingRewardLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    stakingPositionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StakingPosition",
      required: true,
    },
    asset: { type: String, required: true },
    rewardAmount: { type: Number, required: true },
    rateApplied: { type: Number, required: true }, // e.g. Daily rate derived from 3.4% APY
    distributedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const StakingRewardLog =
  mongoose.models.StakingRewardLog ||
  mongoose.model("StakingRewardLog", stakingRewardLogSchema);

export default StakingRewardLog;
import cron from "node-cron";
import mongoose from "mongoose";
import StakingPosition from "../models/StakingPosition.js";
import StakingRewardLog from "../models/StakingRewardLog.js";

export const startYieldCronJob = () => {
  // Runs every day at midnight (00:00 UTC)
  cron.schedule("0 0 * * *", async () => {
    console.log("⚡ [CRON] Running Daily Staking Yield Distribution...");

    try {
      const activePositions = await StakingPosition.find({
        status: "active",
        stakedAmount: { $gt: 0 },
      });

      for (const position of activePositions) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Calculate daily rate based on individual position APY (e.g. 0.034)
          const dailyRate = Math.pow(1 + position.apy, 1 / 365) - 1;
          const rewardAmount = position.stakedAmount * dailyRate;

          // 1. Credit compounding reward
          position.stakedAmount += rewardAmount; // Automatic compounding
          position.accumulatedYield += rewardAmount;
          position.lastYieldAt = new Date();
          await position.save({ session });

          // 2. Audit Trail Log
          await StakingRewardLog.create(
            [
              {
                userId: position.userId,
                stakingPositionId: position._id,
                asset: position.asset,
                rewardAmount,
                rateApplied: dailyRate,
              },
            ],
            { session }
          );

          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          console.error(`❌ Yield Failed for Position ${position._id}:`, error.message);
        } finally {
          session.endSession();
        }
      }
      console.log("✅ [CRON] Daily Yield Distribution Complete.");
    } catch (err) {
      console.error("❌ CRON Job Failure:", err.message);
    }
  });
};
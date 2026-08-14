import cron from "node-cron";
import { 
  checkExpiredLoans, 
  updateOverdueStatus,
  checkLoansNearingExpiry 
} from "../controllers/expiredLoanController.js";

class CronService {
  init() {
    // 1. Daily expired loan check at midnight
    cron.schedule("0 0 * * *", async () => {
     // console.log("[CRON] Running expired loan check...");
      try {
        const result = await checkExpiredLoans();
        console.log("[CRON] Expired loan check completed:", result.summary);
      } catch (error) {
        console.error("[CRON] Error in expired loan check:", error);
      }
    });

    // 2. Daily overdue status update at 1 AM
    cron.schedule("0 1 * * *", async () => {
      console.log("[CRON] Running overdue status update...");
      try {
        const result = await updateOverdueStatus();
        console.log("[CRON] Overdue status update completed:", result);
      } catch (error) {
        console.error("[CRON] Error in overdue status update:", error);
      }
    });

    // 3. Check loans nearing expiry daily at 9 AM
    cron.schedule("0 9 * * *", async () => {
      console.log("[CRON] Checking loans nearing expiry...");
      try {
        const result = await checkLoansNearingExpiry();
        console.log("[CRON] Expiry warning check completed:", result);
      } catch (error) {
        console.error("[CRON] Error checking loans nearing expiry:", error);
      }
    });

    // 4. Hourly check for 9-day overdue loans
    cron.schedule("0 * * * *", async () => {
      console.log("[CRON] Hourly check for severe defaults...");
      try {
        const Loan = (await import("../models/Loan.js")).default;
        const { sendFinalWarningNotification } = await import("../controllers/expiredLoanController.js");
        
        const severeDefaults = await Loan.find({
          status: "defaulted",
          daysOverdue: 9
        }).populate("userId", "email name isBlocked");

        for (const loan of severeDefaults) {
          if (!loan.userId.isBlocked) {
            await sendFinalWarningNotification(loan.userId._id, loan);
            console.log(`[CRON] Final warning sent for loan ${loan.loanId}`);
          }
        }
      } catch (error) {
        console.error("[CRON] Error in hourly check:", error);
      }
    });

    console.log("[CRON] Loan management cron jobs scheduled");
  }
}

export default new CronService();
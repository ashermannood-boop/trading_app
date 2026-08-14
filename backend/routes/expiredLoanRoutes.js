import express from "express";
import {
  checkExpiredLoans,
  getExpiredLoans,
  getExpiredLoanStats,
  getExpiredLoansWithActions,
  unblockUserAndResolveDefaults,
  sendManualReminder,
  manualBlockUser
} from "../controllers/expiredLoanController.js";

import { protect,authorize} from "../middlewares/authMiddleware.js";
import e from "express";

const expiredLoanrouter = express.Router();
//expiredLoanrouter.use(protect);
//expiredLoanrouter.use(authorize('admin', 'support'));

// Admin routes for expired loan management
expiredLoanrouter.get("/admin/expired", getExpiredLoans);
expiredLoanrouter.get("/admin/expired/stats", getExpiredLoanStats);
expiredLoanrouter.get("/admin/expired/with-actions", getExpiredLoansWithActions);
expiredLoanrouter.post("/admin/expired/check", async (req, res) => {
  try {
    const result = await checkExpiredLoans();

    res.status(200).json({
      success: true,
      message: "Expired loan check completed",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
expiredLoanrouter.post("/admin/expired/unblock-user", unblockUserAndResolveDefaults);
expiredLoanrouter.post("/admin/expired/send-reminder/:loanId", sendManualReminder);

// `${backendUrl}api/expired-loans/admin/expired/block/${userId}`,
expiredLoanrouter.post("/admin/expired/block/:userId",(req,res)=>{
  const { userId } = req.params;
  console.log("Received request to block user with ID:", userId);
  manualBlockUser(req, res);

} );

export default expiredLoanrouter;
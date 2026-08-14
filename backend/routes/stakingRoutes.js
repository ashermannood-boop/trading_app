import express from "express";
import {
  createStake,
  unstakeAsset,
  getUserStakingDashboard,
  getAdminStakingOverview,
  updatePositionApy,
  forceClosePosition,
} from "../controllers/stakingController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER ROUTES
router.get("/dashboard", protect, getUserStakingDashboard);
router.post("/stake", protect, createStake);
router.post("/unstake/:positionId", protect, unstakeAsset);

// ADMIN ROUTES
router.use(protect, authorize('admin', 'support'));

router.get("/admin/overview", getAdminStakingOverview);
router.patch("/admin/update-apy/:positionId", updatePositionApy);
router.post("/admin/force-close/:positionId", forceClosePosition);

export default router;
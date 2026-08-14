import express from "express";
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getKYCStatus,
  requestAccountDeletion 
} from "../controllers/profileController.js";
//import { authMiddleware } from "../middlewares/authMiddleware.js";
import { protect,authorize} from "../middlewares/authMiddleware.js";

const profileRoutes = express.Router();

// All routes require authentication
profileRoutes.use(protect);

// Profile routes
profileRoutes.get("/profile", getProfile);
profileRoutes.put("/profile", updateProfile);
profileRoutes.post("/change-password", changePassword);
profileRoutes.get("/kyc-status", getKYCStatus);
profileRoutes.post("/request-deletion", requestAccountDeletion);

export default profileRoutes;
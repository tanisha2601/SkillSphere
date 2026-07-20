import express from "express";
import {
  getAdminStats,
  getAllUsersAdmin,
  suspendUser,
  activateUser,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsersAdmin);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/activate", activateUser);

export default router;
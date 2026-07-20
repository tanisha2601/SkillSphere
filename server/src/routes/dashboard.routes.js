import express from "express";

import {
  getClientDashboard,
  getFreelancerDashboard,
} from "../controllers/dashboard.controller.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/client",
  protect,
  getClientDashboard
);

router.get(
  "/freelancer",
  protect,
  getFreelancerDashboard
);

export default router;
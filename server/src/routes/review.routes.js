import express from "express";

import {
  createReview,
  getFreelancerReviews,
  getMyReviews,
} from "../controllers/review.controller.js";

import {
  protect,
  restrictTo,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===========================================================
   Client Routes
=========================================================== */

// Create a review (client only)
router.post(
  "/",
  protect,
  restrictTo("client"),
  createReview
);

// Get my reviews (client only)
router.get(
  "/my-reviews",
  protect,
  restrictTo("client"),
  getMyReviews
);

/* ===========================================================
   Public Routes
=========================================================== */

// Get freelancer reviews
router.get(
  "/freelancer/:freelancerId",
  getFreelancerReviews
);

export default router;

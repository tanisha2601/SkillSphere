import express from "express";
import {
  createGig,
  getAllGigs,
  getSingleGig,
  updateGig,
  deleteGig,
  getRecommendedGigs,
  getMyGigs,
} from "../controllers/gig.controller.js";

import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
    createGigValidation,
    validate,
} from "../validators/gig.validator.js";

const router = express.Router();

// ========================
// Public Routes
// ========================

router.get("/", getAllGigs);

router.get(
  "/recommended",
  protect,
  restrictTo("freelancer"),
  getRecommendedGigs
);

// GET /api/gigs/my-gigs — client's own gigs, any status (must come before /:id)
router.get(
  "/my-gigs",
  protect,
  restrictTo("client"),
  getMyGigs
);

// GET /api/gigs/:id - Get single gig
router.get("/:id", getSingleGig);

// ========================
// Protected Routes (Client Only)
// ========================

router.post(
    "/",
    protect,
    restrictTo("client"),
    createGigValidation,
    validate,
    createGig
);

router.put(
    "/:id",
    protect,
    restrictTo("client"),
    updateGig
);

router.delete(
    "/:id",
    protect,
    restrictTo("client"),
    deleteGig
);

export default router;
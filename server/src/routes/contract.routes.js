import express from "express";

import {
  getMyContracts,
  getContractById,
  submitWork,
  approveContract,
  updateContractProgress,
} from "../controllers/contract.controller.js";

import {
  protect,
  restrictTo,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===========================================================
   Client Routes
=========================================================== */

// Get all client contracts
router.get(
  "/client",
  protect,
  restrictTo("client"),
  getMyContracts
);

// Approve submitted work
router.patch(
  "/approve/:id",
  protect,
  restrictTo("client"),
  approveContract
);

router.patch(
  "/progress/:id",
  protect,
  restrictTo("freelancer"),
  updateContractProgress
);
/* ===========================================================
   Freelancer Routes
=========================================================== */

// Get all freelancer contracts
router.get(
  "/freelancer",
  protect,
  restrictTo("freelancer"),
  getMyContracts
);

// Submit work
router.patch(
  "/submit/:id",
  protect,
  restrictTo("freelancer"),
  submitWork
);

router.patch(
  "/progress/:id",
  protect,
  restrictTo("freelancer"),
  updateContractProgress
);

/* ===========================================================
   Shared Routes (client + freelancer)
=========================================================== */

// Get single contract by ID
router.get(
  "/:id",
  protect,
  restrictTo("client", "freelancer"),
  getContractById
);

export default router;
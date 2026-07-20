import express from "express";

import {
  createProposal,
  getMyProposals,
  getGigProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
} from "../controllers/proposal.controller.js";

import {
  protect,
  restrictTo,
} from "../middleware/authMiddleware.js";

import {
  createProposalValidation,
  validate,
} from "../validators/proposal.validator.js";

const router = express.Router();

/* ===========================================================
   Freelancer Routes
=========================================================== */

// Submit Proposal
router.post(
  "/:gigId",
  protect,
  restrictTo("freelancer"),
  createProposalValidation,
  validate,
  createProposal
);

// Get Logged-in Freelancer Proposals
router.get(
  "/my-proposals",
  protect,
  restrictTo("freelancer"),
  getMyProposals
);

// Withdraw Proposal
router.patch(
  "/withdraw/:id",
  protect,
  restrictTo("freelancer"),
  withdrawProposal
);

/* ===========================================================
   Client Routes
=========================================================== */

// View All Proposals for a Gig
router.get(
  "/gig/:gigId",
  protect,
  restrictTo("client", "admin"),
  getGigProposals
);

// Accept Proposal
router.patch(
  "/accept/:id",
  protect,
  restrictTo("client", "admin"),
  acceptProposal
);

// Reject Proposal
router.patch(
  "/reject/:id",
  protect,
  restrictTo("client", "admin"),
  rejectProposal
);

export default router;
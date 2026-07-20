import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  submitVerificationRequest,
  getMyVerificationStatus,
  getPendingRequests,
  approveVerification,
  rejectVerification,
  getAllUsersWithVerification,
} from "../controllers/verification.controller.js";

/* ── Inline upload config for verification docs ── */
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "verification");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});
const uploadVerificationDocs = multer({
  storage: verificationStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg","image/png","application/pdf"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPG, PNG or PDF"));
  },
}).array("documents", 5);   // up to 5 docs

const router = express.Router();

/* ─── Freelancer ─────────────────────────────────────────── */
router.post(
  "/request",
  protect,
  restrictTo("freelancer"),
  uploadVerificationDocs,
  submitVerificationRequest
);

router.get(
  "/my-status",
  protect,
  restrictTo("freelancer"),
  getMyVerificationStatus
);

/* ─── Admin ──────────────────────────────────────────────── */
router.get(  "/queue",          protect, restrictTo("admin"), getPendingRequests);
router.get(  "/users",          protect, restrictTo("admin"), getAllUsersWithVerification);
router.patch("/:id/approve",    protect, restrictTo("admin"), approveVerification);
router.patch("/:id/reject",     protect, restrictTo("admin"), rejectVerification);

export default router;

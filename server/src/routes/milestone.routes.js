import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  addMilestone,
  updateMilestone,
  deleteMilestone,
  completeMilestone,
  releaseMilestonePayment,
  getProgressLog,
  addProgressLog,
  getDeadlineInfo,
} from "../controllers/milestone.controller.js";

const router = express.Router({ mergeParams: true }); // mergeParams gives us :id from parent

/* ─── Milestone CRUD ────────────────────────────────────────────── */
router.post  ("/",                    protect,                           addMilestone);
router.put   ("/:mId",                protect,                           updateMilestone);
router.delete("/:mId",                protect,                           deleteMilestone);
router.patch ("/:mId/complete",       protect, restrictTo("freelancer"), completeMilestone);
router.patch ("/:mId/release",        protect, restrictTo("client"),     releaseMilestonePayment);

/* ─── Progress Log ──────────────────────────────────────────────── */
router.get  ("/progress-log",         protect,                           getProgressLog);
router.post ("/progress-log",         protect, restrictTo("freelancer"), addProgressLog);

/* ─── Deadline ──────────────────────────────────────────────────── */
router.get  ("/deadline",             protect,                           getDeadlineInfo);

export default router;

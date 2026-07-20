import express from "express";

import {
  getProfile,
  updateProfile,
  getProfileStats,
  uploadAvatarHandler,
  uploadResumeHandler,
  // Portfolio
  addPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  // Certifications
  addCertification,
  updateCertification,
  deleteCertification,
  // Work Experience
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  // Activity
  getActivityFeed,
  addActivityEntry,
  // Analytics
  incrementProfileView,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/authMiddleware.js";

import {
  uploadAvatar,
  uploadResume,
} from "../middleware/upload.middleware.js";

const router = express.Router();

/* --------------------------------------------------------
   Base profile
-------------------------------------------------------- */
router.get("/profile",        protect, getProfile);
router.put("/profile",        protect, updateProfile);
router.get("/profile/stats",  protect, getProfileStats);

/* --------------------------------------------------------
   File uploads
-------------------------------------------------------- */
router.post("/profile/avatar", protect, uploadAvatar.single("avatar"), uploadAvatarHandler);
router.post("/profile/resume", protect, uploadResume.single("resume"), uploadResumeHandler);

/* --------------------------------------------------------
   Portfolio projects
-------------------------------------------------------- */
router.post(  "/profile/portfolio",             protect, addPortfolioProject);
router.put(   "/profile/portfolio/:projectId",  protect, updatePortfolioProject);
router.delete("/profile/portfolio/:projectId",  protect, deletePortfolioProject);

/* --------------------------------------------------------
   Certifications
-------------------------------------------------------- */
router.post(  "/profile/certifications",         protect, addCertification);
router.put(   "/profile/certifications/:certId", protect, updateCertification);
router.delete("/profile/certifications/:certId", protect, deleteCertification);

/* --------------------------------------------------------
   Work experience
-------------------------------------------------------- */
router.post(  "/profile/work-experience",         protect, addWorkExperience);
router.put(   "/profile/work-experience/:itemId", protect, updateWorkExperience);
router.delete("/profile/work-experience/:itemId", protect, deleteWorkExperience);

/* --------------------------------------------------------
   Activity feed
-------------------------------------------------------- */
router.get( "/profile/activity", protect, getActivityFeed);
router.post("/profile/activity", protect, addActivityEntry);

/* --------------------------------------------------------
   Analytics — track profile view (can be called by other users)
-------------------------------------------------------- */
router.post("/profile/view",          protect, incrementProfileView);
router.post("/profile/view/:userId",  protect, incrementProfileView);

export default router;
import express from "express";

import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  logoutUser,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/authMiddleware.js";

import {
  registerValidation,
  loginValidation,
  validate,
} from "../validators/auth.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  registerValidation,
  validate,
  registerUser
);

router.post(
  "/login",
  loginValidation,
  validate,
  loginUser
);

router.post(
  "/google",
  googleLogin
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.get(
  "/verify-email/:token",
  verifyEmail
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  protect,
  getCurrentUser
);

router.post(
  "/logout",
  protect,
  logoutUser
);

export default router;
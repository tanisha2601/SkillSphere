import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Protect Routes
 * Checks JWT token and authenticates user
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No Token Found
    if (!token) {
      return next(new ApiError(401, "Access denied. Please login first."));
    }

    // Verify Token
    const decoded = verifyToken(token);

    // Find User
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ApiError(401, "User no longer exists."));
    }

    // Optional Checks (Highly Recommended)

    // if (user.status === "blocked") {
    //   return next(new ApiError(403, "Your account has been blocked."));
    // }

    // if (!user.isVerified) {
    //   return next(new ApiError(403, "Please verify your email first."));
    // }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token."));
  }
};

/**
 * Restrict Access Based on Role
 * Example:
 * router.post("/admin", protect, restrictTo("admin"), controller)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "You do not have permission to perform this action."
        )
      );
    }

    next();
  };
};
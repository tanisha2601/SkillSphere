import User from "../models/User.model.js";
import Gig from "../models/Gig.model.js";
import Payment from "../models/Payment.model.js";
import ApiError from "../utils/ApiError.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFreelancers = await User.countDocuments({ role: "freelancer" });
    const totalClients = await User.countDocuments({ role: "client" });
    const totalGigs = await Gig.countDocuments();

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFreelancers,
        totalClients,
        totalGigs,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "suspended" },
      { new: true }
    ).select("-password");

    if (!user) return next(new ApiError(404, "User not found"));

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    ).select("-password");

    if (!user) return next(new ApiError(404, "User not found"));

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
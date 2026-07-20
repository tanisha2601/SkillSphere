import VerificationRequest from "../models/VerificationRequest.model.js";
import User from "../models/User.model.js";
import { notifyAsync } from "../services/notification.service.js";

/* ─────────────────────────────────────────────────────────────
   FREELANCER: Submit verification request (with document paths)
───────────────────────────────────────────────────────────── */
export const submitVerificationRequest = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Only freelancers can request verification" });
    }

    // Build document list from uploaded files + optional JSON body
    const documents = [];

    // Multipart uploads via upload.middleware.js
    if (req.files?.length) {
      req.files.forEach((file) => {
        documents.push({
          label: file.fieldname || "Document",
          url:   `/uploads/verification/${file.filename}`,
        });
      });
    }

    // JSON body documents (url-based, e.g. hosted links)
    if (req.body.documents) {
      const bodyDocs = Array.isArray(req.body.documents)
        ? req.body.documents
        : JSON.parse(req.body.documents);
      documents.push(...bodyDocs.filter((d) => d.url));
    }

    if (!documents.length) {
      return res.status(400).json({ success: false, message: "At least one document is required" });
    }

    // Upsert — allow re-submission if previously rejected
    const existing = await VerificationRequest.findOne({ user: req.user._id });
    if (existing && existing.status === "pending") {
      return res.status(400).json({ success: false, message: "A pending verification request already exists" });
    }

    const request = await VerificationRequest.findOneAndUpdate(
      { user: req.user._id },
      { documents, status: "pending", adminNote: "", reviewedBy: null, reviewedAt: null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify admins (simple broadcast — real system would notify a specific admin user)
    // For now, just return the request; admins see it via the queue endpoint
    return res.status(201).json({ success: true, message: "Verification request submitted", request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   FREELANCER: Check own verification status
───────────────────────────────────────────────────────────── */
export const getMyVerificationStatus = async (req, res) => {
  try {
    const request = await VerificationRequest.findOne({ user: req.user._id })
      .populate("reviewedBy", "fullName");

    const user = await User.findById(req.user._id).select("isIdentityVerified isVerified");

    return res.status(200).json({
      success: true,
      request: request || null,
      isVerified:         user?.isVerified         ?? false,
      isIdentityVerified: user?.isIdentityVerified ?? false,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN: Get all pending requests
───────────────────────────────────────────────────────────── */
export const getPendingRequests = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;

    const requests = await VerificationRequest.find({ status })
      .populate("user", "fullName email avatar role createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await VerificationRequest.countDocuments({ status });

    return res.status(200).json({ success: true, requests, total, page: Number(page) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN: Approve request
───────────────────────────────────────────────────────────── */
export const approveVerification = async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id).populate("user", "_id fullName email");

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ success: false, message: "Request already reviewed" });

    request.status     = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Set user verification flags
    await User.findByIdAndUpdate(request.user._id, {
      isIdentityVerified: true,
      isVerified:         true,
    });

    // Notify freelancer
    notifyAsync({
      user:    request.user._id,
      type:    "system",
      title:   "Verification approved! 🎉",
      message: "Your identity has been verified. A verified badge is now shown on your profile.",
      link:    "/freelancer/profile",
    });

    return res.status(200).json({ success: true, message: "Request approved", request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN: Reject request
───────────────────────────────────────────────────────────── */
export const rejectVerification = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await VerificationRequest.findById(req.params.id).populate("user", "_id fullName");

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ success: false, message: "Request already reviewed" });

    request.status     = "rejected";
    request.adminNote  = reason || "Document verification failed";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Notify freelancer
    notifyAsync({
      user:    request.user._id,
      type:    "system",
      title:   "Verification rejected",
      message: `Your verification was rejected: ${request.adminNote}. You may re-submit with updated documents.`,
      link:    "/freelancer/profile",
    });

    return res.status(200).json({ success: true, message: "Request rejected", request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN: Get all users with enriched verification status
───────────────────────────────────────────────────────────── */
export const getAllUsersWithVerification = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // Attach verification request status for freelancers
    const freelancerIds = users.filter(u => u.role === "freelancer").map(u => u._id);
    const requests = await VerificationRequest.find({ user: { $in: freelancerIds } })
      .select("user status");

    const requestMap = {};
    requests.forEach(r => { requestMap[r.user.toString()] = r.status; });

    const enriched = users.map(u => ({
      ...u.toObject(),
      verificationStatus: u.role === "freelancer" ? (requestMap[u._id.toString()] || "none") : null,
    }));

    return res.status(200).json({ success: true, users: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

import Contract from "../models/Contract.model.js";
import { notifyAsync } from "../services/notification.service.js";

/* ─── helpers ─────────────────────────────────────────────────── */

/** Recalculate contract.progress from completed milestones */
function calcProgress(milestones) {
  if (!milestones?.length) return 0;
  const done = milestones.filter((m) => m.completed).length;
  return Math.round((done / milestones.length) * 100);
}

/** Ensure caller is a participant (client or freelancer) of the contract */
function assertParticipant(contract, userId) {
  const isParticipant =
    contract.client.toString() === userId.toString() ||
    contract.freelancer.toString() === userId.toString();
  if (!isParticipant)
    throw Object.assign(new Error("Not authorised"), { status: 403 });
}

/* ═══════════════════════════════════════════════════════════════
   MILESTONE CRUD
═══════════════════════════════════════════════════════════════ */

/**
 * POST /api/contracts/:id/milestones
 * Both client and freelancer can add milestones while contract is active.
 */
export const addMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    assertParticipant(contract, req.user._id);

    const { title, description, amount, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });

    contract.milestones.push({ title: title.trim(), description, amount, dueDate });
    // Recalculate progress
    contract.progress = calcProgress(contract.milestones);
    await contract.save();

    notifyAsync({
      user:    contract.freelancer,
      type:    "system",
      title:   "New milestone added",
      message: `Milestone "${title}" was added to your contract.`,
      link:    `/freelancer/contract/${contract._id}`,
      relatedId: contract._id,
    });

    return res.status(201).json({ success: true, milestones: contract.milestones, progress: contract.progress });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/contracts/:id/milestones/:mId
 * Update title / description / amount / dueDate (not completion status).
 */
export const updateMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    assertParticipant(contract, req.user._id);

    const milestone = contract.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });

    const { title, description, amount, dueDate } = req.body;
    if (title !== undefined) milestone.title       = title.trim();
    if (description !== undefined) milestone.description = description;
    if (amount !== undefined) milestone.amount     = Number(amount);
    if (dueDate !== undefined) milestone.dueDate   = dueDate ? new Date(dueDate) : undefined;

    await contract.save();
    return res.status(200).json({ success: true, milestones: contract.milestones });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/contracts/:id/milestones/:mId
 * Only allowed if the milestone hasn't been completed yet.
 */
export const deleteMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    assertParticipant(contract, req.user._id);

    const milestone = contract.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
    if (milestone.completed) return res.status(400).json({ success: false, message: "Cannot delete a completed milestone" });

    contract.milestones.pull({ _id: req.params.mId });
    contract.progress = calcProgress(contract.milestones);
    await contract.save();

    return res.status(200).json({ success: true, milestones: contract.milestones, progress: contract.progress });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/contracts/:id/milestones/:mId/complete
 * Freelancer marks a milestone complete → progress auto-recalculated.
 * If all milestones done, contract status → "submitted".
 */
export const completeMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the assigned freelancer can complete milestones" });
    }

    const milestone = contract.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
    if (milestone.completed) return res.status(400).json({ success: false, message: "Milestone already completed" });

    milestone.completed   = true;
    milestone.completedAt = new Date();

    contract.progress = calcProgress(contract.milestones);

    // Auto-update contract status
    if (contract.progress > 0 && contract.progress < 100) {
      contract.status = "in-progress";
    } else if (contract.progress === 100) {
      contract.status    = "submitted";
      contract.workSubmitted = true;
      contract.submittedAt   = new Date();
    }

    await contract.save();

    // Notify client
    notifyAsync({
      user:    contract.client,
      type:    "system",
      title:   "Milestone completed",
      message: `Freelancer completed milestone: "${milestone.title}"`,
      link:    `/client/contract/${contract._id}`,
      relatedId: contract._id,
    });

    return res.status(200).json({
      success: true,
      message: "Milestone marked complete",
      contract,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/contracts/:id/milestones/:mId/release
 * Client releases payment for a specific completed milestone.
 */
export const releaseMilestonePayment = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the client can release milestone payments" });
    }

    const milestone = contract.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
    if (!milestone.completed) return res.status(400).json({ success: false, message: "Cannot release payment for an incomplete milestone" });
    if (milestone.paymentReleased) return res.status(400).json({ success: false, message: "Payment already released" });

    milestone.paymentReleased   = true;
    milestone.paymentReleasedAt = new Date();

    await contract.save();

    // Notify freelancer
    notifyAsync({
      user:    contract.freelancer,
      type:    "payment_received",
      title:   "Milestone payment released",
      message: `Client released $${milestone.amount || 0} for milestone: "${milestone.title}"`,
      link:    `/freelancer/contract/${contract._id}`,
      relatedId: contract._id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment released",
      milestones: contract.milestones,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════════
   PROGRESS LOG
═══════════════════════════════════════════════════════════════ */

/**
 * GET /api/contracts/:id/progress-log
 */
export const getProgressLog = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .select("progressLogs client freelancer")
      .populate("progressLogs.loggedBy", "fullName avatar role");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    assertParticipant(contract, req.user._id);

    const logs = [...(contract.progressLogs || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({ success: true, progressLogs: logs });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/contracts/:id/progress-log
 * Freelancer adds a progress note (optionally updates progress %).
 */
export const addProgressLog = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the freelancer can add progress logs" });
    }

    const { note, progress } = req.body;
    if (!note?.trim()) return res.status(400).json({ success: false, message: "Note is required" });

    const logEntry = {
      note:      note.trim(),
      progress:  progress !== undefined ? Number(progress) : contract.progress,
      loggedBy:  req.user._id,
    };

    contract.progressLogs.unshift(logEntry);

    // Optionally update overall progress if no milestones tracking it
    if (progress !== undefined && !contract.milestones.length) {
      const p = Number(progress);
      contract.progress = Math.min(100, Math.max(0, p));
      if (p > 0 && p < 100) contract.status = "in-progress";
      if (p === 100) {
        contract.status        = "submitted";
        contract.workSubmitted = true;
        contract.submittedAt   = new Date();
      }
    }

    // Keep only last 100 logs
    if (contract.progressLogs.length > 100) {
      contract.progressLogs = contract.progressLogs.slice(0, 100);
    }

    await contract.save();

    // Notify client
    notifyAsync({
      user:    contract.client,
      type:    "system",
      title:   "Progress update",
      message: `Freelancer posted an update: "${note.trim().substring(0, 60)}${note.length > 60 ? '…' : ''}"`,
      link:    `/client/contract/${contract._id}`,
      relatedId: contract._id,
    });

    return res.status(201).json({
      success: true,
      progressLogs: contract.progressLogs,
      progress: contract.progress,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/contracts/:id/deadline
 * Returns days remaining until contract deadline.
 */
export const getDeadlineInfo = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).select(
      "startedAt deliveryTime deadline status client freelancer"
    );
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    assertParticipant(contract, req.user._id);

    const deadline =
      contract.deadline ||
      new Date(new Date(contract.startedAt).getTime() + contract.deliveryTime * 86400000);

    const now        = Date.now();
    const diffMs     = deadline.getTime() - now;
    const daysLeft   = Math.ceil(diffMs / 86400000);
    const isOverdue  = daysLeft < 0;
    const isDueSoon  = daysLeft >= 0 && daysLeft <= 2;

    return res.status(200).json({
      success: true,
      deadline,
      daysLeft:  Math.abs(daysLeft),
      isOverdue,
      isDueSoon,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

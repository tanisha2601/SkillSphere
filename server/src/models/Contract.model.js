import mongoose from "mongoose";

/* ─── Progress Log ─────────────────────────────────────────────── */
const progressLogSchema = new mongoose.Schema(
  {
    note:      { type: String, trim: true, maxlength: 500 },
    progress:  { type: Number, min: 0, max: 100 },
    loggedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

/* ─── Milestone ─────────────────────────────────────────────────── */
const milestoneSchema = new mongoose.Schema(
  {
    title:              { type: String, required: true, trim: true },
    description:        { type: String, trim: true, default: "" },
    amount:             { type: Number, default: 0, min: 0 },   // portion of budget
    dueDate:            { type: Date },
    completed:          { type: Boolean, default: false },
    completedAt:        { type: Date },
    paymentReleased:    { type: Boolean, default: false },
    paymentReleasedAt:  { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

/* ─── Contract ──────────────────────────────────────────────────── */
const contractSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },

    agreedBudget: { type: Number, required: true },
    deliveryTime: { type: Number, required: true },

    workSubmitted: { type: Boolean, default: false },
    submittedAt:   { type: Date },

    clientApproved: { type: Boolean, default: false },
    approvedAt:     { type: Date },

    startedAt:      { type: Date, default: Date.now },
    completionDate: { type: Date },

    deadline: { type: Date },   // computed from startedAt + deliveryTime on contract creation

    progress:     { type: Number, default: 0, min: 0, max: 100 },
    progressLogs: [progressLogSchema],

    milestones: [milestoneSchema],

    status: {
      type: String,
      enum: ["pending", "active", "in-progress", "submitted", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

/* ─── Indexes ───────────────────────────────────────────────────── */
contractSchema.index({ client: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ status: 1 });

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,   // one active request per freelancer
    },

    documents: [
      {
        label: { type: String, trim: true },     // e.g. "National ID", "Degree Certificate"
        url:   { type: String },                  // stored path from upload middleware
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminNote: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

verificationRequestSchema.index({ status: 1 });

const VerificationRequest = mongoose.model("VerificationRequest", verificationRequestSchema);

export default VerificationRequest;

import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverLetter: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    proposedBudget: {
      type: Number,
      required: true,
      min: 1,
    },

    deliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// One freelancer can submit only one proposal per gig
proposalSchema.index(
  {
    gig: 1,
    freelancer: 1,
  },
  {
    unique: true,
  }
);

const Proposal = mongoose.model("Proposal", proposalSchema);

export default Proposal;
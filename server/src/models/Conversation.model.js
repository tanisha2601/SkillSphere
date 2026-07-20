import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      default: null,
    },

    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Two users + gig lookup
conversationSchema.index({
  participants: 1,
  gig: 1,
});

// Sort conversation list
conversationSchema.index({
  lastMessageAt: -1,
});

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    attachment: {
      url: {
        type: String,
        default: "",
      },
      fileName: {
        type: String,
        default: "",
      },
      fileType: {
        type: String,
        default: "",
      },
      fileSize: {
        type: Number,
        default: 0,
      },
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Fast message loading
messageSchema.index({
  conversation: 1,
  createdAt: -1,
});

// Sender lookup
messageSchema.index({
  sender: 1,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
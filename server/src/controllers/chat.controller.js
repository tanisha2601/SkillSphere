import mongoose from "mongoose";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getIO, userRoom } from "../sockets/socket.js";
import { notifyAsync } from "../services/notification.service.js";

// POST /api/chat/conversations   body: { recipientId, gigId? }
export const startConversation = async (req, res, next) => {
  try {
    const { recipientId, gigId } = req.body;

    if (!recipientId) {
      return next(new ApiError(400, "recipientId is required"));
    }

    if (recipientId === String(req.user._id)) {
      return next(new ApiError(400, "You cannot message yourself"));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
      ...(gigId ? { gig: gigId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        gig: gigId || null,
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, conversation, "Conversation ready"));
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/conversations
export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "fullName avatar role")
      .populate("gig", "title")
      .sort({ lastMessageAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, conversations, "Conversations fetched"));
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/conversations/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return next(new ApiError(404, "Conversation not found"));
    }
    if (!conversation.participants.some((p) => p.equals(req.user._id))) {
      return next(new ApiError(403, "Not part of this conversation"));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "fullName avatar");

    await Message.updateMany(
      { conversation: id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, messages.reverse(), "Messages fetched")
      );
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/conversations/:id/messages   body: { text, attachment? }
export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, attachment } = req.body;

    if (!text && !attachment) {
      return next(new ApiError(400, "Message text or attachment required"));
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return next(new ApiError(404, "Conversation not found"));
    }
    if (!conversation.participants.some((p) => p.equals(req.user._id))) {
      return next(new ApiError(403, "Not part of this conversation"));
    }

    const message = await Message.create({
      conversation: id,
      sender: req.user._id,
      text: text || "",
      attachment: attachment || undefined,
      readBy: [req.user._id],
    });

    conversation.lastMessage = text || "📎 Attachment";
    conversation.lastMessageAt = new Date();
    await conversation.save();

   const populatedMessage = await message.populate([
  {
    path: "sender",
    select: "fullName avatar role",
  },
  {
    path: "conversation",
  },
]);

    const io = getIO();
   if (io) {
  io.to(`chat:${id}`).emit("receive_message", populatedMessage);

  io.to(`chat:${id}`).emit("conversation_updated", {
    conversationId: id,
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
  });
}

    const recipients = conversation.participants.filter(
  (p) => !p.equals(req.user._id)
);

recipients.forEach((recipientId) => {
  notifyAsync({
    user: recipientId,
    type: "new_message",
    title: `New message from ${req.user.fullName}`,
    message: text ? text.slice(0, 80) : "Sent an attachment",
    link: `/chat/${id}`,
    relatedId: id,
  });

  const io2 = getIO();

  if (io2) {
    io2.to(userRoom(recipientId)).emit("conversation_updated", {
      conversationId: id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    });
  }
}); // <-- YE LINE MISSING HAI

return res
  .status(201)
  .json(new ApiResponse(201, populatedMessage, "Message sent"));
  } catch (error) {
    next(error);
  }
};
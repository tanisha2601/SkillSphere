import express from "express";

import {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/conversations", startConversation);
router.get("/conversations", getMyConversations);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);

export default router;
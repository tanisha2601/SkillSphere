import api from "./api";

// POST /api/chat/conversations  { recipientId, gigId? }
export const startConversation = async (recipientId, gigId) => {
  return await api.post("/chat/conversations", { recipientId, gigId });
};

// GET /api/chat/conversations
export const getMyConversations = async () => {
  return await api.get("/chat/conversations");
};

// GET /api/chat/conversations/:id/messages
export const getMessages = async (conversationId, params = {}) => {
  return await api.get(`/chat/conversations/${conversationId}/messages`, {
    params,
  });
};

// POST /api/chat/conversations/:id/messages  { text, attachment? }
export const sendMessage = async (conversationId, payload) => {
  return await api.post(
    `/chat/conversations/${conversationId}/messages`,
    payload
  );
};
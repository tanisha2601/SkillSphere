import api from "./api";

// GET /api/notifications
export const getMyNotifications = async (params = {}) => {
  return await api.get("/notifications", { params });
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async () => {
  return await api.patch("/notifications/read-all");
};

// DELETE /api/notifications/:id
export const deleteNotification = async (id) => {
  return await api.delete(`/notifications/${id}`);
};
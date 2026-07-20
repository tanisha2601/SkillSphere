import api from "./api";

// GET Notifications
export const getNotifications = async () => {
  return await api.get("/notifications");
};

// Mark Single Notification Read
export const markNotificationRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

// Mark All Notifications Read
export const markAllNotificationsRead = async () => {
  return await api.patch("/notifications/read-all");
};

// Delete Notification
export const deleteNotification = async (id) => {
  return await api.delete(`/notifications/${id}`);
};
import Notification from "../models/Notification.model.js";
import { getIO, userRoom } from "../sockets/socket.js";

/**
 * Create a notification in the DB and push it live over Socket.IO
 * if the target user currently has a connection open.
 */
export const sendNotification = async ({
  user,
  type,
  title,
  message,
  link = "",
  relatedId = null,
}) => {
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    link,
    relatedId,
  });

  const io = getIO();
  if (io) {
    io.to(userRoom(user)).emit("new_notification", notification);
  }

  return notification;
};

/**
 * Fire-and-forget wrapper — controllers can call this without
 * awaiting so the main API response isn't slowed down by it.
 */
export const notifyAsync = (payload) => {
  sendNotification(payload).catch((err) =>
    console.error("Notification error:", err.message)
  );
};

export default { sendNotification, notifyAsync };
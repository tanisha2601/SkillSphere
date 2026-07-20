import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

let ioInstance = null;

/**
 * Returns the room name a given user listens on for
 * private events (notifications, direct messages).
 */
export const userRoom = (userId) => `user:${userId}`;

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
   try {
    const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
        return next();
    }

    const decoded = verifyToken(token);

    socket.userId = decoded.id;

    next();

} catch (err) {
    return next(new Error("Authentication failed"));
}
  });

  io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    if (socket.userId) {
      socket.join(userRoom(socket.userId));
    }

    socket.on("join_chat", (conversationId) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on("leave_chat", (conversationId) => {
      socket.leave(`chat:${conversationId}`);
    });

    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      socket.to(`chat:${conversationId}`).emit("typing", { userId, isTyping });
    });

    socket.on("send_message", (message) => {
      io.to(`chat:${message.conversationId}`).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => ioInstance;

export default initializeSocket;
import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import initializeSocket from "./src/sockets/socket.js";

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);








// Uncaught Exceptions catch
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down server...");
  console.error(err.name, err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO Server
initializeSocket(server);

// Bind Listener
const PORT = process.env.PORT || 5000;

const runningServer = server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

// Unhandled Rejections catch
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down server...");
  console.error(err.name, err.message);

  runningServer.close(() => {
    process.exit(1);
  });
});
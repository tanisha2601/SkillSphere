import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import ApiError from "./utils/ApiError.js";
import errorHandler from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/admin.routes.js";

// Routes
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import gigRouter from "./routes/gig.routes.js";
import proposalRouter from "./routes/proposal.routes.js";
import contractRouter from "./routes/contract.routes.js";
import milestoneRouter from "./routes/milestone.routes.js";
import reviewRouter from "./routes/review.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import chatRouter from "./routes/chat.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import verificationRouter from "./routes/verification.routes.js";


const app = express();

/* ==========================================================
   CORS
========================================================== */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);
app.use("/api/admin", adminRoutes);

/* ==========================================================
   Middleware
========================================================== */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

app.use(cookieParser());

/* ==========================================================
   Static Files
========================================================== */
app.use("/uploads", express.static("uploads"));

/* ==========================================================
   API Routes
========================================================== */

app.use("/api/health", healthRouter);

app.use("/api/auth", authRouter);

app.use("/api/gigs", gigRouter);

app.use("/api/proposals", proposalRouter);

app.use("/api/contracts", contractRouter);
app.use("/api/contracts/:id/milestones", milestoneRouter);

app.use(
  "/api/users",
  userRouter
);

app.use("/api/reviews", reviewRouter);

app.use("/api/payments", paymentRouter);

app.use(
  "/api/notifications",
  notificationRouter
);

app.use("/api/chat", chatRouter);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use("/api/verification", verificationRouter);
/* ==========================================================
   404 Handler
========================================================== */

app.use("*", (req, res, next) => {
  next(
    new ApiError(
      404,
      `Route ${req.originalUrl} not found`
    )
  );
});

/* ==========================================================
   Global Error Handler
========================================================== */

app.use(errorHandler);

export default app;
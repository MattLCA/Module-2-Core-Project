// ============================================================
// ModernTech HR Backend
// ============================================================

import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

// ============================================================
// SHARED ROUTES
// ============================================================

import authRoutes from "./routes/authRoutes.js";

import employeeRoutes from "./routes/employeeRoutes.js";

import payrollRoutes from "./routes/payrollRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";

import performanceRoutes from "./routes/performanceRoutes.js";

import notificationRoutes from "./routes/notificationRoutes.js";

import goalRoutes from "./routes/goalRoutes.js";

import reviewCycleRoutes from "./routes/reviewCycleRoutes.js";

// ============================================================
// HR-SPECIFIC ROUTES
// ============================================================

import attendanceRoutes from "./routes/attendanceRoutes.js";

import leaveRoutes from "./routes/leaveRoutes.js";

import timeoffRoutes from "./routes/timeoffRoutes.js";

import issuesRoutes from "./routes/issuesRoutes.js";

// ============================================================
// WORKER ROUTES
// ============================================================

import workerRoutes from "./routes/worker/workerRoutes.js";

// ============================================================
// ERROR HANDLER
// ============================================================

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ============================================================
// SECURITY
// ============================================================

app.use(helmet());

// ============================================================
// CORS
// ============================================================

const defaultOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",

  "http://localhost:5503",
  "http://127.0.0.1:5503",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // curl/Postman may not
      // send an Origin header.

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
  }),
);

// ============================================================
// JSON
// ============================================================

app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",

    message: "ModernTech API is running",
  });
});

// ============================================================
// AUTH
// ============================================================

app.use("/api/auth", authRoutes);

// ============================================================
// SHARED HR DATA
// ============================================================

app.use("/api/employees", employeeRoutes);

app.use("/api/payroll", payrollRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/performance", performanceRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/goals", goalRoutes);

app.use("/api/review-cycle", reviewCycleRoutes);

// ============================================================
// HR MANAGEMENT
// ============================================================

app.use("/api/attendance", attendanceRoutes);

app.use("/api/leave", leaveRoutes);

app.use("/api/timeoff", timeoffRoutes);

app.use("/api/issues", issuesRoutes);

// ============================================================
// WORKER PORTAL
// ============================================================
//
// This keeps Angela's worker-specific implementation intact.
//
// Final URLs:
//
// /api/worker/dashboard
// /api/worker/profile
// /api/worker/attendance
// /api/worker/leave
// /api/worker/payslips
// /api/worker/notifications
//
// ============================================================

app.use("/api/worker", workerRoutes);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",

    path: req.originalUrl,
  });
});

// ============================================================
// CENTRAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// SERVER
// ============================================================

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

export default app;

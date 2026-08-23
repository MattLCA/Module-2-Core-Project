// ============================================================
// ModernTech HR Backend
// ============================================================
//
// Supports both:
//
// 1. Worker Portal
// 2. HR Portal
//
// Architecture:
//
// Frontend
//     ↓
// Express API
//     ↓
// Routes
//     ↓
// Controllers
//     ↓
// Models
//     ↓
// MySQL
//
// ============================================================

import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

// ============================================================
// SHARED / GENERAL ROUTES
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
// HR ROUTES
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
// ERROR HANDLING
// ============================================================

import { errorHandler } from "./middleware/errorHandler.js";


// ============================================================
// CREATE EXPRESS APP
// ============================================================

const app = express();


// ============================================================
// SECURITY
// ============================================================

app.use(helmet());


// ============================================================
// CORS
// ============================================================
//
// The worker and HR frontends may be running on different
// local development ports.
//
// You can override these through:
//
// CORS_ORIGINS=http://localhost:5500,http://localhost:5503
//
// ============================================================

const defaultOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5503",
    "http://127.0.0.1:5503"
];

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : defaultOrigins;

app.use(
    cors({
        origin: (origin, callback) => {

            // Requests from tools such as Postman and curl may not
            // include an Origin header.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(
                    `CORS blocked this origin: ${origin}`
                )
            );
        }
    })
);


// ============================================================
// JSON BODY PARSER
// ============================================================

app.use(
    express.json()
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({
            status: "ok",
            message: "ModernTech API is running"
        });

    }
);


// ============================================================
// AUTHENTICATION
// ============================================================
//
// Both worker and HR login through:
//
// POST /api/auth/login
//
// Worker:
// {
//     role: "worker",
//     identifier: "EMP001",
//     password: "..."
// }
//
// HR:
// {
//     role: "hr",
//     identifier: "email@moderntech.com",
//     password: "..."
// }
//
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);


// ============================================================
// EMPLOYEES
// ============================================================

app.use(
    "/api/employees",
    employeeRoutes
);


// ============================================================
// HR PAYROLL
// ============================================================

app.use(
    "/api/payroll",
    payrollRoutes
);


// ============================================================
// HR DASHBOARD
// ============================================================

app.use(
    "/api/dashboard",
    dashboardRoutes
);


// ============================================================
// PERFORMANCE
// ============================================================

app.use(
    "/api/performance",
    performanceRoutes
);


// ============================================================
// SHARED NOTIFICATIONS
// ============================================================
//
// These routes are available to authenticated workers AND HR.
//
// Your notificationRoutes.js uses:
//
// authenticate
//
// to ensure the logged-in user's employeeId is used.
//
// Examples:
//
// GET   /api/notifications
// GET   /api/notifications/unread-count
// PATCH /api/notifications/:id/read
// PATCH /api/notifications/read-all
//
// ============================================================

app.use(
    "/api/notifications",
    notificationRoutes
);


// ============================================================
// GOALS / OKRs
// ============================================================

app.use(
    "/api/goals",
    goalRoutes
);


// ============================================================
// PERFORMANCE REVIEW CYCLES
// ============================================================

app.use(
    "/api/review-cycle",
    reviewCycleRoutes
);


// ============================================================
// HR ATTENDANCE
// ============================================================
//
// Examples:
//
// GET /api/attendance
// PUT /api/attendance/:id/verify
//
// ============================================================

app.use(
    "/api/attendance",
    attendanceRoutes
);


// ============================================================
// HR LEAVE
// ============================================================
//
// Examples:
//
// GET  /api/leave
// POST /api/leave
// PUT  /api/leave/:id/decision
//
// ============================================================

app.use(
    "/api/leave",
    leaveRoutes
);


// ============================================================
// HR TIME OFF
// ============================================================

app.use(
    "/api/timeoff",
    timeoffRoutes
);


// ============================================================
// HR ISSUES
// ============================================================

app.use(
    "/api/issues",
    issuesRoutes
);


// ============================================================
// WORKER PORTAL
// ============================================================
//
// workerRoutes should contain:
//
// /dashboard
// /profile
// /attendance
// /leave
// /payslips
// /notifications
//
// Therefore the final worker URLs become:
//
// /api/worker/dashboard
// /api/worker/profile
// /api/worker/attendance/...
// /api/worker/leave/...
// /api/worker/payslips/...
// /api/worker/notifications/...
//
// ============================================================

app.use(
    "/api/worker",
    workerRoutes
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    (req, res) => {

        res.status(404).json({
            error: "Not found",
            path: req.originalUrl
        });

    }
);


// ============================================================
// CENTRAL ERROR HANDLER
// ============================================================
//
// This must be registered LAST so it can catch errors thrown
// by all controllers and middleware above.
//
// ============================================================

app.use(
    errorHandler
);


// ============================================================
// START SERVER
// ============================================================

const PORT =
    process.env.PORT || 4000;

app.listen(
    PORT,
    () => {

        console.log(
            `API listening on port ${PORT}`
        );

    }
);


export default app;
// ============================================================
// ModernTech Worker Routes
// ============================================================

import express from "express";

import dashboardRoutes from "./dashboardRoutes.js";
import profileRoutes from "./profileRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import payslipRoutes from "./payslipRoutes.js";
import notificationRoutes from "./notificationRoutes.js";


const router =
    express.Router();


// ============================================================
// DASHBOARD
// ============================================================
//
// GET /api/worker/dashboard
// ============================================================

router.use(
    "/dashboard",
    dashboardRoutes
);


// ============================================================
// PROFILE
// ============================================================
//
// GET /api/worker/profile
// ============================================================

router.use(
    "/profile",
    profileRoutes
);


// ============================================================
// ATTENDANCE
// ============================================================
//
// GET  /api/worker/attendance/clock-status
// POST /api/worker/attendance/clock-in
// PUT  /api/worker/attendance/clock-out
// GET  /api/worker/attendance/history
// ============================================================

router.use(
    "/attendance",
    attendanceRoutes
);


// ============================================================
// LEAVE
// ============================================================
//
// GET  /api/worker/leave/types
// GET  /api/worker/leave/balances
// GET  /api/worker/leave/requests
// POST /api/worker/leave/requests
// ============================================================

router.use(
    "/leave",
    leaveRoutes
);


// ============================================================
// PAYSLIPS
// ============================================================
//
// GET /api/worker/payslips
// GET /api/worker/payslips/:id
// GET /api/worker/payslips/:id/download
// ============================================================

router.use(
    "/payslips",
    payslipRoutes
);


// ============================================================
// NOTIFICATIONS
// ============================================================
//
// GET   /api/worker/notifications
// GET   /api/worker/notifications/unread
// GET   /api/worker/notifications/unread-count
// GET   /api/worker/notifications/:id
// PATCH /api/worker/notifications/:id/read
// PATCH /api/worker/notifications/read-all
// ============================================================

router.use(
    "/notifications",
    notificationRoutes
);


export default router;
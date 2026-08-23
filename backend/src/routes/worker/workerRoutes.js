// ============================================================
// ModernTech Worker Routes
// ============================================================

import express from "express";

import dashboardRoutes from "./dashboardRoutes.js";
import profileRoutes from "./profileRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import payslipRoutes from "./payslipRoutes.js";

// IMPORTANT:
// Use the shared notification router.
// Do NOT maintain a second worker notification system.
import notificationRoutes from "../notificationRoutes.js";


const router = express.Router();


// ============================================================
// DASHBOARD
// ============================================================

router.use(
    "/dashboard",
    dashboardRoutes
);


// ============================================================
// PROFILE
// ============================================================

router.use(
    "/profile",
    profileRoutes
);


// ============================================================
// ATTENDANCE
// ============================================================

router.use(
    "/attendance",
    attendanceRoutes
);


// ============================================================
// LEAVE
// ============================================================

router.use(
    "/leave",
    leaveRoutes
);


// ============================================================
// PAYSLIPS
// ============================================================

router.use(
    "/payslips",
    payslipRoutes
);


// ============================================================
// NOTIFICATIONS
// ============================================================
//
// This uses the shared notification router.
//
// Therefore BOTH of these work:
//
// /api/notifications
//
// /api/worker/notifications
//
// They use the same database table, authentication,
// controller and model.
//
// ============================================================

router.use(
    "/notifications",
    notificationRoutes
);


export default router;
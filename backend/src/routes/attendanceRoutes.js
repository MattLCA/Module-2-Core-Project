// ============================================================
// ModernTech HR Attendance Routes
// ============================================================

import express from "express";

import {
    getDailyAttendance,
    verifyAttendance
} from "../controllers/attendanceController.js";

import {
    authenticate,
    authorize
} from "../middleware/auth.js";

import {
    validateAttendanceUpdate
} from "../middleware/validationMiddleware.js";


const router =
    express.Router();


// ============================================================
// ALL HR ATTENDANCE ROUTES REQUIRE AUTHENTICATION
// ============================================================

router.use(
    authenticate
);


// ============================================================
// GET DAILY ATTENDANCE
// ============================================================
//
// HR only.
//
// GET /api/attendance
// ============================================================

router.get(
    "/",
    authorize("hr"),
    getDailyAttendance
);


// ============================================================
// VERIFY / UPDATE ATTENDANCE
// ============================================================
//
// HR only.
//
// PUT /api/attendance/:id/verify
// ============================================================

router.put(
    "/:id/verify",
    authorize("hr"),
    validateAttendanceUpdate,
    verifyAttendance
);


export default router;
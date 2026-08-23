import express from "express";

import {
    getLeaveRequests,
    submitLeaveRequest,
    processLeaveDecision
} from "../controllers/leaveController.js";

import {
    authenticate,
    authorize
} from "../middleware/auth.js";

import {
    validateLeaveSubmission,
    validateLeaveDecision
} from "../middleware/validationMiddleware.js";


const router = express.Router();


// ============================================================
// GET ALL LEAVE REQUESTS
// HR ONLY
// ============================================================

router.get(
    "/",
    authenticate,
    authorize("hr"),
    getLeaveRequests
);


// ============================================================
// CREATE LEAVE REQUEST
// WORKER ONLY
//
// employeeId is taken from req.user.employeeId
// ============================================================

router.post(
    "/",
    authenticate,
    authorize("worker"),
    validateLeaveSubmission,
    submitLeaveRequest
);


// ============================================================
// APPROVE / REJECT LEAVE REQUEST
// HR ONLY
//
// PUT /api/leave/:id/decision
// ============================================================

router.put(
    "/:id/decision",
    authenticate,
    authorize("hr"),
    validateLeaveDecision,
    processLeaveDecision
);


export default router;
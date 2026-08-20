import express from "express";
import {
  getLeaveRequests,
  submitLeaveRequest,
  processLeaveDecision,
} from "../controllers/leaveController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import {
  validateLeaveSubmission,
  validateLeaveDecision,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("HR", "hr"),
  getLeaveRequests,
);
router.post(
  "/",
  authenticateToken,
  validateLeaveSubmission,
  submitLeaveRequest,
);
router.put(
  "/:id/decision",
  authenticateToken,
  authorizeRoles("HR", "hr"),
  validateLeaveDecision,
  processLeaveDecision,
);

export default router;

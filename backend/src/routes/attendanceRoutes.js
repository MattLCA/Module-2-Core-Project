import express from "express";
import {
  getLeaveRequests,
  submitLeaveRequest,
  processLeaveDecision,
} from "../controllers/leaveController.js";

import { authenticate, authorize } from "../middleware/auth.js";
import {
  validateLeaveSubmission,
  validateLeaveDecision,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", authenticate, authorize("hr"), getLeaveRequests);

router.post("/", authenticate, validateLeaveSubmission, submitLeaveRequest);

router.put(
  "/:id/decision",
  authenticate,
  authorize("hr"),
  validateLeaveDecision,
  processLeaveDecision,
);

export default router;

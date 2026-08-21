import express from "express";
import {
  getLeaveRequests,
  submitLeaveRequest,
  processLeaveDecision,
} from "./LeaveModel.js"; // Pointing side-by-side inside the backend/src/modules/leave folder
import { authenticate, authorize } from "../../middleware/auth.js"; // Backing up two directories to backend/src/middleware/
import {
  validateLeaveSubmission,
  validateLeaveDecision,
} from "../../middleware/validationMiddleware.js"; // Backing up two directories to backend/src/middleware/

const router = express.Router();

// Production endpoints from your functional module template
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

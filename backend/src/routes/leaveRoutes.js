import express from "express";
import {
  getLeaveRequests,
  submitLeaveRequest,
  processLeaveDecision,
} from "./LeaveModel.js"; // Pointing side-by-side inside backend/src/modules/leave/
import { authenticate, authorize } from "../../middleware/auth.js"; // Stepping back 2 levels to backend/src/middleware/
import {
  validateLeaveSubmission,
  validateLeaveDecision,
} from "../../middleware/validationMiddleware.js"; // Stepping back 2 levels to backend/src/middleware/

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

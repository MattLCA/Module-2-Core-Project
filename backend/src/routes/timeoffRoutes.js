import express from "express";
import { getTimeOffRequests, processTimeOffDecision } from "./TimeOffModel.js"; // Pointing side-by-side inside backend/src/modules/timeoff/
import { authenticate, authorize } from "../../middleware/auth.js"; // Stepping back 2 levels to backend/src/middleware/

const router = express.Router();

router.get("/", authenticate, authorize("hr"), getTimeOffRequests);
router.put(
  "/:id/decision",
  authenticate,
  authorize("hr"),
  processTimeOffDecision,
);

export default router;

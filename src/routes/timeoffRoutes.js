import express from "express";
import {
  getTimeOffRequests,
  processTimeOffDecision,
} from "../controllers/timeoffController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("HR", "Admin"),
  getTimeOffRequests,
);
router.put(
  "/:id/decision",
  authenticateToken,
  authorizeRoles("HR", "Admin"),
  processTimeOffDecision,
);

export default router;

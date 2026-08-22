import express from "express";
import {
  getTimeOffRequests,
  processTimeOffDecision,
} from "../controllers/timeoffController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorize("hr"), getTimeOffRequests);

router.put(
  "/:id/decision",
  authenticate,
  authorize("hr"),
  processTimeOffDecision,
);

export default router;
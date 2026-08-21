import express from "express";
import { getIssues, createIssue, updateIssueStatus } from "./IssuesModel.js"; // Pointing side-by-side inside the backend/src/modules/issues folder
import { authenticate, authorize } from "../../middleware/auth.js"; // Backing up two directories to backend/src/middleware/
import {
  validateIssueCreation,
  validateIssueStatusUpdate,
} from "../../middleware/validationMiddleware.js"; // Backing up two directories to backend/src/middleware/

const router = express.Router();

router.get("/", authenticate, authorize("hr"), getIssues);
router.post("/", authenticate, createIssue);
router.put(
  "/:id/status",
  authenticate,
  authorize("hr"),
  validateIssueStatusUpdate,
  updateIssueStatus,
);

export default router;

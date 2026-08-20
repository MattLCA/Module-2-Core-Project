import express from "express";
import {
  getIssues,
  createIssue,
  updateIssueStatus,
} from "../controllers/issuesController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import {
  validateIssueCreation,
  validateIssueStatusUpdate,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("HR", "hr"), getIssues);
router.post("/", authenticateToken, validateIssueCreation, createIssue);
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("HR", "hr"),
  validateIssueStatusUpdate,
  updateIssueStatus,
);

export default router;

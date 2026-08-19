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

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("HR", "Admin"), getIssues);
router.post("/", authenticateToken, createIssue);
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("HR", "Admin"),
  updateIssueStatus,
);

export default router;

import express from "express";
import {
  getIssues,
  createIssue,
  updateIssueStatus,
} from "../controllers/issuesController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorize("hr"), getIssues);

router.post("/", authenticate, createIssue);

router.put("/:id/status", authenticate, authorize("hr"), updateIssueStatus);

export default router;
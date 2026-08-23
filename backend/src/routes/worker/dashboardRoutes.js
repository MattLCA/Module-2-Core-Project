import express from "express";

import { getDashboard } from "../../controllers/worker/dashboardController.js";

import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authenticate);

// ============================================================
// DASHBOARD
// ============================================================

// Get worker dashboard
router.get("/", getDashboard);

export default router;

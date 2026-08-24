import express from "express";
import * as controller from "../controllers/reviewCycleController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("hr"));

router.get("/", controller.getFunnel);
router.patch("/:employeeId", controller.updateProgress);

export default router;

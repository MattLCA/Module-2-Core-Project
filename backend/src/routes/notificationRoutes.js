// ============================================================
// ModernTech Shared Notification Routes
// ============================================================

import express from "express";

import * as controller
    from "../controllers/notificationController.js";

import {
    authenticate
} from "../middleware/auth.js";


const router = express.Router();


router.use(
    authenticate
);


// ============================================================
// GET ALL
// ============================================================

router.get(
    "/",
    controller.list
);


// ============================================================
// GET UNREAD
// ============================================================

router.get(
    "/unread",
    controller.unread
);


// ============================================================
// GET UNREAD COUNT
// ============================================================

router.get(
    "/unread-count",
    controller.unreadCount
);


// ============================================================
// GET ONE
// ============================================================

router.get(
    "/:id",
    controller.getOne
);


// ============================================================
// MARK ONE AS READ
// ============================================================

router.patch(
    "/:id/read",
    controller.markOneRead
);


// ============================================================
// MARK ALL AS READ
// ============================================================

router.patch(
    "/read-all",
    controller.markAllRead
);


export default router;
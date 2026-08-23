// ============================================================
// ModernTech Notification Routes
// ============================================================

import express from "express";

import * as controller
    from "../controllers/notificationController.js";

import {
    authenticate
} from "../middleware/auth.js";


const router =
    express.Router();


// ============================================================
// ALL NOTIFICATION ROUTES REQUIRE LOGIN
// ============================================================

router.use(
    authenticate
);


// ============================================================
// GET ALL
// ============================================================
//
// GET /api/notifications
//
// ============================================================

router.get(
    "/",
    controller.list
);


// ============================================================
// GET UNREAD
// ============================================================
//
// GET /api/notifications/unread
//
// ============================================================

router.get(
    "/unread",
    controller.unread
);


// ============================================================
// GET UNREAD COUNT
// ============================================================
//
// GET /api/notifications/unread-count
//
// ============================================================

router.get(
    "/unread-count",
    controller.unreadCount
);


// ============================================================
// GET ONE
// ============================================================
//
// IMPORTANT:
// This must come AFTER the more specific routes above,
// otherwise /unread-count could be treated as an ID.
//
// GET /api/notifications/:id
//
// ============================================================

router.get(
    "/:id",
    controller.getOne
);


// ============================================================
// MARK ONE AS READ
// ============================================================
//
// PATCH /api/notifications/:id/read
//
// ============================================================

router.patch(
    "/:id/read",
    controller.markOneRead
);


// ============================================================
// MARK ALL AS READ
// ============================================================
//
// PATCH /api/notifications/read-all
//
// ============================================================

router.patch(
    "/read-all",
    controller.markAllRead
);


export default router;
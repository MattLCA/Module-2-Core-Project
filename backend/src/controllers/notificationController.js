// ============================================================
// ModernTech Notification Controller
// ============================================================

import * as notificationModel
    from "../models/notificationModel.js";


// ============================================================
// GET ALL NOTIFICATIONS
// ============================================================
//
// GET /api/notifications
//
// Only returns notifications belonging to the logged-in user.
//
// ============================================================

async function list(
    req,
    res,
    next
) {

    try {

        const employeeId =
            req.user.employeeId;


        const notifications =
            await notificationModel
                .findAllForEmployee(
                    employeeId
                );


        return res.status(200).json({
            data: notifications
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// GET UNREAD NOTIFICATIONS
// ============================================================
//
// GET /api/notifications/unread
//
// ============================================================

async function unread(
    req,
    res,
    next
) {

    try {

        const employeeId =
            req.user.employeeId;


        const notifications =
            await notificationModel
                .findUnreadForEmployee(
                    employeeId
                );


        return res.status(200).json({
            data: notifications
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// GET UNREAD COUNT
// ============================================================
//
// GET /api/notifications/unread-count
//
// ============================================================

async function unreadCount(
    req,
    res,
    next
) {

    try {

        const employeeId =
            req.user.employeeId;


        const count =
            await notificationModel
                .getUnreadCount(
                    employeeId
                );


        return res.status(200).json({
            data: {
                count
            }
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// GET ONE NOTIFICATION
// ============================================================
//
// GET /api/notifications/:id
//
// ============================================================

async function getOne(
    req,
    res,
    next
) {

    try {

        const employeeId =
            req.user.employeeId;


        const notification =
            await notificationModel
                .findById(
                    req.params.id,
                    employeeId
                );


        if (!notification) {

            return res.status(404).json({
                error:
                    "Notification not found."
            });

        }


        return res.status(200).json({
            data: notification
        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// MARK ONE AS READ
// ============================================================
//
// PATCH /api/notifications/:id/read
//
// ============================================================

async function markOneRead(
    req,
    res,
    next
) {

    try {

        const employeeId =
            req.user.employeeId;


        // First make sure the notification
        // actually belongs to this employee.

        const notification =
            await notificationModel
                .findById(
                    req.params.id,
                    employeeId
                );


        if (!notification) {

            return res.status(404).json({
                error:
                    "Notification not found."
            });

        }


        const updated =
            await notificationModel
                .markAsRead(
                    req.params.id,
                    employeeId
                );


        return res.status(200).json({

            message:
                updated
                    ? "Notification marked as read."
                    : "Notification was already marked as read."

        });

    } catch (error) {

        next(error);

    }

}


// ============================================================
// MARK ALL AS READ
// ============================================================
//
// PATCH /api/notifications/read-all
//
// ============================================================

async function markAllRead(
    req,
    res,
    next
) {

    try {

        const employeeId =
            req.user.employeeId;


        const updatedCount =
            await notificationModel
                .markAllAsRead(
                    employeeId
                );


        return res.status(200).json({

            message:
                "All notifications marked as read.",

            updatedCount

        });

    } catch (error) {

        next(error);

    }

}


export {
    list,
    unread,
    unreadCount,
    getOne,
    markOneRead,
    markAllRead
};
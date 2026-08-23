// ============================================================
// ModernTech Notification Controller
// ============================================================

import * as notificationModel from "../models/notificationModel.js";

// ============================================================
// GET ALL
// ============================================================

async function list(req, res, next) {
  try {
    const employeeId = req.user.employeeId;

    const notifications =
      await notificationModel.findAllForEmployee(employeeId);

    return res.status(200).json({
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET UNREAD
// ============================================================

async function unread(req, res, next) {
  try {
    const employeeId = req.user.employeeId;

    const notifications =
      await notificationModel.findUnreadForEmployee(employeeId);

    return res.status(200).json({
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET UNREAD COUNT
// ============================================================

async function unreadCount(req, res, next) {
  try {
    const employeeId = req.user.employeeId;

    const count = await notificationModel.getUnreadCount(employeeId);

    return res.status(200).json({
      data: {
        count,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET ONE
// ============================================================

async function getOne(req, res, next) {
  try {
    const employeeId = req.user.employeeId;

    const notification = await notificationModel.findById(
      req.params.id,
      employeeId,
    );

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found.",
      });
    }

    return res.status(200).json({
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// MARK ONE AS READ
// ============================================================

async function markOneRead(req, res, next) {
  try {
    const employeeId = req.user.employeeId;

    const notification = await notificationModel.findById(
      req.params.id,
      employeeId,
    );

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found.",
      });
    }

    const updated = await notificationModel.markAsRead(
      req.params.id,
      employeeId,
    );

    return res.status(200).json({
      message: updated
        ? "Notification marked as read."
        : "Notification was already marked as read.",
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// MARK ALL AS READ
// ============================================================

async function markAllRead(req, res, next) {
  try {
    const employeeId = req.user.employeeId;

    const updatedCount = await notificationModel.markAllAsRead(employeeId);

    return res.status(200).json({
      message: "All notifications marked as read.",

      updatedCount,
    });
  } catch (error) {
    next(error);
  }
}

export { list, unread, unreadCount, getOne, markOneRead, markAllRead };

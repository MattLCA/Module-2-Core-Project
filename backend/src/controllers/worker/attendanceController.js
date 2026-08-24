import {
  getActiveAttendance,
  getTodayAttendance,
  createClockIn,
  updateClockOut,
  getHistoryByEmployeeId,
} from "../../models/worker/attendanceModel.js";

// ============================================================
// GET CURRENT CLOCK STATUS
// ============================================================
// GET /api/worker/attendance/clock-status
//
// Possible states:
//
// CLOCKED_OUT
// WORKING
//
// The database determines the state.
// ============================================================

export const getClockStatus = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const todayAttendance = await getTodayAttendance(employeeId);

    // --------------------------------------------------------
    // No attendance record today
    // --------------------------------------------------------

    if (!todayAttendance) {
      return res.status(200).json({
        isClockedIn: false,

        state: "CLOCKED_OUT",

        activeRecord: null,

        todayAttendance: null,
      });
    }

    // --------------------------------------------------------
    // Already clocked out today
    // --------------------------------------------------------

    if (todayAttendance.clockOut) {
      return res.status(200).json({
        isClockedIn: false,

        state: "CLOCKED_OUT",

        activeRecord: null,

        todayAttendance,
      });
    }

    // --------------------------------------------------------
    // Clocked in and still working
    // --------------------------------------------------------

    return res.status(200).json({
      isClockedIn: true,

      state: "WORKING",

      activeRecord: todayAttendance,

      todayAttendance,
    });
  } catch (error) {
    console.error("getClockStatus error:", error);

    return res.status(500).json({
      error: "Failed to retrieve clock status.",
    });
  }
};

// ============================================================
// CLOCK IN
// ============================================================
// POST /api/worker/attendance/clock-in
//
// Worker can only clock in once per day.
// ============================================================

export const clockIn = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    // --------------------------------------------------------
    // Check whether today's attendance already exists
    // --------------------------------------------------------

    const existing = await getTodayAttendance(employeeId);

    if (existing) {
      if (existing.clockOut) {
        return res.status(400).json({
          message: "You have already clocked in and clocked out today.",
        });
      }

      return res.status(400).json({
        message: "You have already clocked in today.",
      });
    }

    // --------------------------------------------------------
    // Create today's attendance record
    // --------------------------------------------------------

    await createClockIn(employeeId);

    return res.status(201).json({
      message: "Clocked in successfully.",
    });
  } catch (error) {
    console.error("clockIn error:", error);

    // --------------------------------------------------------
    // Duplicate daily attendance protection
    // --------------------------------------------------------

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "You have already clocked in today.",
      });
    }

    return res.status(500).json({
      error: "Failed to clock in.",
    });
  }
};

// ============================================================
// CLOCK OUT
// ============================================================
// PUT /api/worker/attendance/clock-out
//
// Worker can only clock out after clocking in.
// Once clocked out, another clock-out is rejected.
// ============================================================

export const clockOut = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    // --------------------------------------------------------
    // Find today's active attendance record
    // --------------------------------------------------------

    const activeRecord = await getActiveAttendance(employeeId);

    if (!activeRecord) {
      // Check whether the worker already clocked out today
      const todayAttendance = await getTodayAttendance(employeeId);

      if (todayAttendance?.clockOut) {
        return res.status(400).json({
          message: "You have already clocked out today.",
        });
      }

      return res.status(400).json({
        message: "You are not currently clocked in.",
      });
    }

    // --------------------------------------------------------
    // Close today's attendance record
    // --------------------------------------------------------

    const result = await updateClockOut(activeRecord.attendanceId);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Unable to clock out.",
      });
    }

    return res.status(200).json({
      message: "Clocked out successfully.",
    });
  } catch (error) {
    console.error("clockOut error:", error);

    return res.status(500).json({
      error: "Failed to clock out.",
    });
  }
};

// ============================================================
// ATTENDANCE HISTORY
// ============================================================
// GET /api/worker/attendance/history
// ============================================================

export const getAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const history = await getHistoryByEmployeeId(employeeId);

    return res.status(200).json({
      data: history,
    });
  } catch (error) {
    console.error("getAttendanceHistory error:", error);

    return res.status(500).json({
      error: "Failed to retrieve attendance history.",
    });
  }
};

// =========================================================================
// MODULE: ATTENDANCE CONTROLLER (FINAL PRODUCTION LAYOUT)
// File: src/controllers/attendanceController.js
// Description: Manages requests for daily clock logs and shift data.
//              Synchronized completely with the updated AttendanceModel.
// =========================================================================

import AttendanceModel from "../modules/AttendanceModel.js";

/**
 * @route   GET /api/attendance
 * @desc    Fetch daily logs compiled across structural relational table fields
 * @access  Private (HR/Admin)
 */
export const getDailyAttendance = async (req, res) => {
  try {
    // Invokes the correct method mapped to your new database schema configuration
    const rows = await AttendanceModel.findDailyLogs();

    // Generates a clean boolean flag so your frontend code maps properly
    const mappedRows = rows.map((row) => ({
      ...row,
      isVerified: row.clockIn !== "00:00:00" && row.clockIn !== null,
    }));

    return res.status(200).json(mappedRows);
  } catch (error) {
    console.error("Error fetching attendance logs:", error);
    return res.status(500).json({
      message: "Internal server error while fetching attendance records.",
    });
  }
};

/**
 * @route   PUT /api/attendance/:id/verify
 * @desc    Processes administrative modifications on employee shift stamps
 * @access  Private (HR/Admin)
 */
export const verifyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceStatus, clockIn, clockOut } = req.body;

    // Checks that the required update fields are present in the request
    if (!attendanceStatus) {
      return res
        .status(400)
        .json({ message: "Attendance status is required." });
    }

    // Confirms that the target attendance log row exists in the database
    const record = await AttendanceModel.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // Executes the update query through the model layer abstraction class
    await AttendanceModel.updateLog(id, attendanceStatus, clockIn, clockOut);

    return res.status(200).json({
      message: "Attendance record verified and updated successfully.",
    });
  } catch (error) {
    console.error("Error verifying attendance log entry:", error);
    return res.status(500).json({
      message: "Internal server error while updating attendance verification.",
    });
  }
};

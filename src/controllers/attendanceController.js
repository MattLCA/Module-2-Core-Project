import AttendanceModel from "../modules/AttendanceModel.js";

export const getDailyAttendance = async (req, res) => {
  try {
    const rows = await AttendanceModel.findAllWithEmployeeDetails();

    // Maintain your virtual frontend compatibility payload flag safely
    const mappedRows = rows.map((row) => ({
      ...row,
      isVerified: row.clockIn !== "00:00:00",
    }));

    return res.status(200).json(mappedRows);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching attendance." });
  }
};

export const verifyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceStatus, clockIn, clockOut } = req.body;

    if (!attendanceStatus) {
      return res
        .status(400)
        .json({ message: "Attendance status is required." });
    }

    const record = await AttendanceModel.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    await AttendanceModel.updateVerification(
      id,
      attendanceStatus,
      clockIn,
      clockOut,
    );
    return res.status(200).json({
      message: "Attendance record verified and updated successfully.",
    });
  } catch (error) {
    console.error("Error verifying attendance:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while verifying attendance." });
  }
};

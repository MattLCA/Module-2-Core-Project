import LeaveModel from "../modules/leave/LeaveModel.js";

export const getLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const rows = await LeaveModel.findAll(status);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return res.status(500).json({
      message: "Internal server error while fetching leave requests.",
    });
  }
};

export const submitLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, totalDays } = req.body;
    if (!employeeId || !leaveTypeId || !startDate || !endDate || !totalDays) {
      return res
        .status(400)
        .json({ message: "Missing required leave fields." });
    }

    const result = await LeaveModel.create(req.body);
    return res.status(201).json({
      message: "Leave request submitted successfully.",
      requestId: result.insertId,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while submitting leave." });
  }
};

export const processLeaveDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects 'Approved' or 'Rejected' (matching your new enum lookups)

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        message: "Status must be 'Approved', 'Rejected', or 'Pending'.",
      });
    }

    const record = await LeaveModel.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    // Pass the reviewer ID from the decrypted JWT payload token
    const reviewerId = req.user?.id || null;

    await LeaveModel.updateStatus(id, status, reviewerId);
    return res
      .status(200)
      .json({ message: `Leave request ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error("Error processing leave decision:", error);
    return res
      .status(500)
      .json({ message: "Internal server error processing leave decision." });
  }
};

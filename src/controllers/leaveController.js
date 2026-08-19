import LeaveModel from "../modules/LeaveModel.js";

export const getLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const rows = await LeaveModel.findAll(status);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return res
      .status(500)
      .json({
        message: "Internal server error while fetching leave requests.",
      });
  }
};

export const submitLeaveRequest = async (req, res) => {
  try {
    const {
      employeeId,
      departmentId,
      managerId,
      leaveType,
      startDate,
      endDate,
      duration,
    } = req.body;
    if (
      !employeeId ||
      !departmentId ||
      !managerId ||
      !leaveType ||
      !startDate ||
      !endDate ||
      !duration
    ) {
      return res
        .status(400)
        .json({ message: "Missing required leave fields." });
    }

    const result = await LeaveModel.create(req.body);
    return res
      .status(201)
      .json({
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
    const { status } = req.body;

    if (!["Approved", "Denied", "Pending"].includes(status)) {
      return res
        .status(400)
        .json({
          message: "Status must be 'Approved', 'Denied', or 'Pending'.",
        });
    }

    const record = await LeaveModel.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    await LeaveModel.updateStatus(id, status);
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

import TimeOffModel from "../modules/TimeOffModel.js";

export const getTimeOffRequests = async (req, res) => {
  try {
    const rows = await TimeOffModel.findSingleDayRequests();
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching time off requests:", error);
    return res
      .status(500)
      .json({
        message: "Internal server error while fetching time off requests.",
      });
  }
};

export const processTimeOffDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Denied"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'Approved' or 'Denied'." });
    }

    const result = await TimeOffModel.updateSingleDayStatus(id, status);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Single-day time off record not found." });
    }

    return res
      .status(200)
      .json({
        message: `Time off request ${status.toLowerCase()} successfully.`,
      });
  } catch (error) {
    console.error("Error processing time off decision:", error);
    return res
      .status(500)
      .json({
        message: "Internal server error while processing time off decision.",
      });
  }
};

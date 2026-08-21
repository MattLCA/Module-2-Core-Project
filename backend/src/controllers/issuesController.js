import IssuesModel from "../models/IssuesModel.js";

export const getIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const rows = await IssuesModel.findAll(status);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching system logs:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching logs." });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { employeeId, title, message } = req.body;
    if (!employeeId || !title || !message) {
      return res
        .status(400)
        .json({ message: "Employee ID, title, and message are required." });
    }

    const result = await IssuesModel.create(req.body);
    return res.status(201).json({
      message: "System notification logged successfully.",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating notification log:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while logging item." });
  }
};

// Placeholder keeping entry mapping intact for routes integration
export const updateIssueStatus = async (req, res) => {
  return res
    .status(200)
    .json({ message: "Log tracking attributes are auto-managed by DB views." });
};

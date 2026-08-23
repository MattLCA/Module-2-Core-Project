import IssuesModel from "../modules/issues/IssuesModel.js";

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
    const { title, description } = req.body;
    const employeeId = req.user?.id;

    if (!employeeId || !title || !description) {
      return res.status(400).json({
        message: "Employee ID, title, and description are required.",
      });
    }

    const result = await IssuesModel.create({
      employeeId,
      title,
      message: description,
    });

    return res.status(201).json({
      message: "Issue reported successfully.",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return res.status(500).json({
      message: "Internal server error while creating issue.",
    });
  }
};

// Placeholder keeping entry mapping intact for routes integration
export const updateIssueStatus = async (req, res) => {
  return res
    .status(200)
    .json({ message: "Log tracking attributes are auto-managed by DB views." });
};

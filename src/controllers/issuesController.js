import IssuesModel from "../modules/IssuesModel.js";

export const getIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const rows = await IssuesModel.findAll(status);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching issues." });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { subject, category, departmentId, priority } = req.body;
    if (!subject || !category || !departmentId || !priority) {
      return res
        .status(400)
        .json({
          message:
            "Subject, category, departmentId, and priority are required.",
        });
    }

    const result = await IssuesModel.create(req.body);
    return res
      .status(201)
      .json({
        message: "Issue reported successfully.",
        reportId: result.insertId,
      });
  } catch (error) {
    console.error("Error creating issue:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while submitting issue." });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status field is required." });
    }

    const result = await IssuesModel.updateStatus(id, status);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Issue record not found." });
    }

    return res
      .status(200)
      .json({ message: "Issue status updated successfully." });
  } catch (error) {
    console.error("Error updating issue status:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while updating issue status." });
  }
};

const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    for (const field of requiredFields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      ) {
        missingFields.push(field);
      }
    }
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Validation constraints validation failure.",
        error: `Missing required body fields: ${missingFields.join(", ")}`,
      });
    }
    return next();
  };
};

// Updated verification array property fields matching your normalized definitions
export const validateAttendanceUpdate = validateFields(["attendanceStatus"]);
export const validateLeaveSubmission = validateFields([
  "employeeId",
  "leaveTypeId",
  "startDate",
  "endDate",
  "totalDays",
  "reason",
]);
export const validateLeaveDecision = validateFields(["status"]);
export const validateIssueCreation = validateFields([
  "employeeId",
  "title",
  "message",
]);
export const validateIssueStatusUpdate = validateFields(["status"]);
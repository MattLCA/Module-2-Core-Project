// ============================================================
// ModernTech Validation Middleware
// ============================================================

function validateFields(requiredFields = []) {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      const value = req.body?.[field];

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Validation failed.",
        details: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
}

// ============================================================
// HR ATTENDANCE
// ============================================================

const validateAttendanceUpdate = validateFields(["attendanceStatus"]);

// ============================================================
// LEAVE SUBMISSION
//
// IMPORTANT:
// employeeId is deliberately NOT required here.
// The backend gets employeeId from req.user.employeeId.
// ============================================================

const validateLeaveSubmission = validateFields([
  "leaveTypeId",
  "startDate",
  "endDate",
  "totalDays",
]);

// ============================================================
// HR LEAVE DECISION
// ============================================================

const validateLeaveDecision = validateFields(["status"]);

// ============================================================
// ISSUES
// ============================================================

const validateIssueCreation = validateFields([
  "employeeId",
  "title",
  "message",
]);

const validateIssueStatusUpdate = validateFields(["status"]);

export {
  validateFields,
  validateAttendanceUpdate,
  validateLeaveSubmission,
  validateLeaveDecision,
  validateIssueCreation,
  validateIssueStatusUpdate,
};

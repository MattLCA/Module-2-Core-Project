// ============================================================
// ModernTech Validation Middleware
// ============================================================
//
// These validators are used by the HR-side routes.
//
// Worker routes perform additional validation in their own
// controllers because those requests use the authenticated
// worker ID from req.user.
// ============================================================


// ============================================================
// GENERIC REQUIRED-FIELD VALIDATOR
// ============================================================

function validateFields(
    requiredFields
) {

    return (
        req,
        res,
        next
    ) => {

        const missingFields = [];


        for (
            const field of requiredFields
        ) {

            const value =
                req.body?.[field];


            // Treat null, undefined and empty strings as missing.

            if (
                value === undefined ||
                value === null ||
                (
                    typeof value === "string" &&
                    value.trim() === ""
                )
            ) {

                missingFields.push(
                    field
                );

            }

        }


        if (
            missingFields.length > 0
        ) {

            return res.status(400).json({

                message:
                    "Validation failed.",

                error:
                    `Missing required body fields: ${missingFields.join(", ")}`

            });

        }


        return next();

    };

}


// ============================================================
// ATTENDANCE UPDATE
// ============================================================
//
// Used by:
//
// PUT /api/attendance/:id/verify
// ============================================================

const validateAttendanceUpdate =
    validateFields([
        "attendanceStatus"
    ]);


// ============================================================
// LEAVE SUBMISSION
// ============================================================
//
// Used by the HR/general leave route.
//
// NOTE:
// The worker leave system uses its authenticated employee ID
// instead of trusting a client-supplied employee ID.
// ============================================================

const validateLeaveSubmission =
    validateFields([
        "employeeId",
        "leaveTypeId",
        "startDate",
        "endDate",
        "totalDays",
        "reason"
    ]);


// ============================================================
// LEAVE DECISION
// ============================================================
//
// Used by HR when approving/rejecting a leave request.
// ============================================================

const validateLeaveDecision =
    validateFields([
        "status"
    ]);


// ============================================================
// ISSUE CREATION
// ============================================================

const validateIssueCreation =
    validateFields([
        "employeeId",
        "title",
        "message"
    ]);


// ============================================================
// ISSUE STATUS UPDATE
// ============================================================

const validateIssueStatusUpdate =
    validateFields([
        "status"
    ]);


// ============================================================
// EXPORT
// ============================================================

export {
    validateFields,
    validateAttendanceUpdate,
    validateLeaveSubmission,
    validateLeaveDecision,
    validateIssueCreation,
    validateIssueStatusUpdate
};
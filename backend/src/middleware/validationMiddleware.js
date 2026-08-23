// ============================================================
// ModernTech Validation Middleware
// ============================================================

function validateFields(
    requiredFields
) {

    return (
        req,
        res,
        next
    ) => {

        const missing = [];


        for (
            const field of requiredFields
        ) {

            const value =
                req.body?.[field];


            if (
                value === undefined ||
                value === null ||
                (
                    typeof value === "string" &&
                    value.trim() === ""
                )
            ) {

                missing.push(field);

            }

        }


        if (
            missing.length > 0
        ) {

            return res.status(400).json({

                error:
                    "Validation failed.",

                details:
                    `Missing required fields: ${missing.join(", ")}`

            });

        }


        return next();

    };

}


// HR attendance
const validateAttendanceUpdate =
    validateFields([
        "attendanceStatus"
    ]);


// HR leave
const validateLeaveSubmission =
    validateFields([
        "employeeId",
        "leaveTypeId",
        "startDate",
        "endDate",
        "totalDays",
        "reason"
    ]);


// HR leave decision
const validateLeaveDecision =
    validateFields([
        "status"
    ]);


// Issues
const validateIssueCreation =
    validateFields([
        "employeeId",
        "title",
        "message"
    ]);


const validateIssueStatusUpdate =
    validateFields([
        "status"
    ]);


export {
    validateFields,
    validateAttendanceUpdate,
    validateLeaveSubmission,
    validateLeaveDecision,
    validateIssueCreation,
    validateIssueStatusUpdate
};
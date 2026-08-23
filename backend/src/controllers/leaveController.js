import LeaveModel from "../modules/leave/LeaveModel.js";
import { create } from "../models/notificationModel.js";

// ============================================================
// GET ALL LEAVE REQUESTS
// ============================================================

export const getLeaveRequests = async (req, res) => {
    try {

        const { status } = req.query;

        const rows = await LeaveModel.findAll(
            status || null
        );

        return res.status(200).json({
            data: rows
        });

    } catch (error) {

        console.error(
            "[HR Leave] Error fetching leave requests:",
            error
        );

        return res.status(500).json({
            error: "Internal server error while fetching leave requests."
        });
    }
};


// ============================================================
// CREATE LEAVE REQUEST
// ============================================================

export const submitLeaveRequest = async (req, res) => {

    try {

        const {
            employeeId,
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason
        } = req.body;


        if (
            !employeeId ||
            !leaveTypeId ||
            !startDate ||
            !endDate ||
            !totalDays
        ) {

            return res.status(400).json({
                error: "Missing required leave fields."
            });
        }


        const result =
            await LeaveModel.create(req.body);


        return res.status(201).json({

            message:
                "Leave request submitted successfully.",

            data: {
                requestId: result.insertId
            }

        });

    } catch (error) {

        console.error(
            "[HR Leave] Error submitting leave request:",
            error
        );

        return res.status(500).json({
            error:
                "Internal server error while submitting leave."
        });
    }
};


// ============================================================
// PROCESS HR LEAVE DECISION
// ============================================================
//
// PUT /api/leave/:id/decision
//
// Body:
// {
//     "status": "Approved"
// }
//
// OR
//
// {
//     "status": "Rejected",
//     "reason": "Reason"
// }
//
// ============================================================

export const processLeaveDecision = async (req, res) => {

    try {

        const requestId =
            Number(req.params.id);

        const {
            status,
            reason
        } = req.body;


        // --------------------------------------------------------
        // Validate request ID
        // --------------------------------------------------------

        if (
            !Number.isInteger(requestId) ||
            requestId <= 0
        ) {

            return res.status(400).json({
                error:
                    "Invalid leave request ID."
            });
        }


        // --------------------------------------------------------
        // Validate status
        // --------------------------------------------------------

        if (
            ![
                "Approved",
                "Rejected"
            ].includes(status)
        ) {

            return res.status(400).json({
                error:
                    "Status must be Approved or Rejected."
            });
        }


        // --------------------------------------------------------
        // Find leave request
        // --------------------------------------------------------

        const record =
            await LeaveModel.findById(
                requestId
            );


        if (!record) {

            return res.status(404).json({
                error:
                    "Leave request not found."
            });
        }


        // --------------------------------------------------------
        // Get HR employee ID
        // --------------------------------------------------------

        const reviewerId =
            req.user?.employeeId;


        if (!reviewerId) {

            return res.status(401).json({
                error:
                    "Authenticated HR employee ID is missing."
            });
        }


        console.log(
            "[HR Leave] Processing decision:",
            {
                requestId,
                status,
                reviewerId,
                workerEmployeeId:
                    record.employeeId
            }
        );


        // --------------------------------------------------------
        // UPDATE LEAVE REQUEST
        // --------------------------------------------------------

        await LeaveModel.updateStatus(
            requestId,
            status,
            reviewerId
        );


        console.log(
            "[HR Leave] Leave request updated successfully:",
            {
                requestId,
                status,
                reviewerId
            }
        );


        // --------------------------------------------------------
        // CREATE WORKER NOTIFICATION
        // --------------------------------------------------------
        //
        // IMPORTANT:
        // A notification failure must NOT undo the leave
        // decision that has already been saved.
        //
        // --------------------------------------------------------

        let notificationCreated = false;


        try {

            const notificationTitle =
                status === "Approved"
                    ? "Leave Request Approved"
                    : "Leave Request Rejected";


            const notificationMessage =
                status === "Approved"

                    ? `Your ${record.leaveType} request from ${record.startDate} to ${record.endDate} has been approved by HR.`

                    : `Your ${record.leaveType} request from ${record.startDate} to ${record.endDate} has been rejected by HR${reason ? `: ${reason}` : "."}`;


            console.log(
                "[HR Leave] Creating worker notification:",
                {
                    employeeId:
                        record.employeeId,

                    notificationType:
                        "leave",

                    title:
                        notificationTitle,

                    message:
                        notificationMessage
                }
            );


            const notification =
                await create({

                    employeeId:
                        record.employeeId,

                    notificationType:
                        "leave",

                    title:
                        notificationTitle,

                    message:
                        notificationMessage,

                    status:
                        "New"

                });


            notificationCreated =
                Boolean(notification);


            console.log(
                "[HR Leave] Notification created:",
                notification
            );


        } catch (notificationError) {

            console.error(
                "[HR Leave] NOTIFICATION CREATION FAILED:",
                notificationError
            );

            console.error(
                "[HR Leave] Notification error message:",
                notificationError.message
            );

            // Deliberately do not throw here.
            // The leave decision has already been saved.
        }


        // --------------------------------------------------------
        // RETURN SUCCESS
        // --------------------------------------------------------

        return res.status(200).json({

            message:
                status === "Approved"
                    ? "Leave request approved successfully."
                    : "Leave request rejected successfully.",

            data: {

                requestId,

                status,

                reviewedBy:
                    reviewerId,

                notificationCreated

            }

        });

    } catch (error) {

        console.error(
            "[HR Leave] Error processing leave decision:",
            error
        );

        return res.status(500).json({
            error:
                "Internal server error processing leave decision.",

            details:
                error.message
        });
    }
};
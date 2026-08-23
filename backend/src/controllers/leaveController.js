import LeaveModel from "../modules/leave/LeaveModel.js";
import {
    create
} from "../models/notificationModel.js";


// ============================================================
// GET ALL LEAVE REQUESTS
// HR ONLY
// ============================================================

export const getLeaveRequests = async (
    req,
    res,
    next
) => {

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

        next(error);
    }
};


// ============================================================
// CREATE LEAVE REQUEST
//
// NOTE:
// This route is now HR/worker-safe because the worker employee
// ID MUST come from the authenticated JWT.
// ============================================================

export const submitLeaveRequest = async (
    req,
    res,
    next
) => {

    try {

        const employeeId =
            req.user?.employeeId;

        if (!employeeId) {
            return res.status(401).json({
                error:
                    "Authenticated employee ID is missing."
            });
        }

        const {
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason
        } = req.body;


        if (
            !leaveTypeId ||
            !startDate ||
            !endDate ||
            totalDays === undefined ||
            totalDays === null
        ) {
            return res.status(400).json({
                error:
                    "Missing required leave fields."
            });
        }


        const result =
            await LeaveModel.create({

                employeeId,

                leaveTypeId:
                    Number(leaveTypeId),

                startDate,

                endDate,

                totalDays:
                    Number(totalDays),

                reason:
                    reason || null
            });


        // ====================================================
        // NOTIFY HR
        // ====================================================

        let hrNotificationCreated = false;

        try {

            const notification = await import(
                "../models/notificationModel.js"
            ).then(module =>
                module.createForRole({
                    roleName: "hr",
                    notificationType: "leave",
                    title: "New Leave Request",
                    message:
                        `A new leave request has been submitted by employee ${employeeId}.`,
                    status: "New"
                })
            );

            hrNotificationCreated =
                Array.isArray(notification)
                    ? notification.length > 0
                    : Boolean(notification);

        } catch (notificationError) {

            console.error(
                "[HR Leave] Failed to notify HR:",
                notificationError
            );

        }


        return res.status(201).json({

            message:
                "Leave request submitted successfully.",

            data: {

                requestId:
                    result.insertId,

                leaveRequestId:
                    result.insertId,

                employeeId,

                leaveTypeId:
                    Number(leaveTypeId),

                startDate,

                endDate,

                totalDays:
                    Number(totalDays),

                reason:
                    reason || null,

                status:
                    "Pending",

                notificationCreated:
                    hrNotificationCreated
            }

        });

    } catch (error) {

        console.error(
            "[HR Leave] Error submitting leave request:",
            error
        );

        next(error);
    }
};


// ============================================================
// PROCESS HR LEAVE DECISION
//
// PUT /api/leave/:id/decision
// ============================================================

export const processLeaveDecision = async (
    req,
    res,
    next
) => {

    try {

        const requestId =
            Number(req.params.id);

        const {
            status,
            reason
        } = req.body;


        // ----------------------------------------------------
        // VALIDATE ID
        // ----------------------------------------------------

        if (
            !Number.isInteger(requestId) ||
            requestId <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid leave request ID."
            });
        }


        // ----------------------------------------------------
        // VALIDATE STATUS
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // FIND REQUEST
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // GET HR ID
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // SAVE DECISION
        // ----------------------------------------------------

        const updateResult =
            await LeaveModel.updateStatus(
                requestId,
                status,
                reviewerId
            );


        if (
            !updateResult ||
            updateResult.affectedRows === 0
        ) {

            return res.status(404).json({
                error:
                    "Leave request could not be updated."
            });

        }


        console.log(
            "[HR Leave] Leave request updated successfully:",
            {
                requestId,
                status,
                reviewerId
            }
        );


        // ----------------------------------------------------
        // NOTIFY WORKER
        // ----------------------------------------------------

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
                "[HR Leave] Worker notification created:",
                notification
            );

        } catch (notificationError) {

            console.error(
                "[HR Leave] Notification creation failed:",
                notificationError
            );

        }


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

        next(error);
    }
};
import {
    getLeaveTypes,
    getLeaveBalances,
    getLeaveRequests,
    getLeaveTypeById,
    getLeaveBalanceByType,
    hasOverlappingLeave,
    createLeaveRequest
} from "../../models/worker/leaveModel.js";

import {
    createForRole
} from "../../models/notificationModel.js";


// ============================================================
// CALCULATE DAYS
// ============================================================

function calculateDays(
    startDate,
    endDate
) {

    const start =
        new Date(
            `${startDate}T00:00:00`
        );

    const end =
        new Date(
            `${endDate}T00:00:00`
        );


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {

        return null;

    }


    if (
        end < start
    ) {

        return null;

    }


    return Math.floor(

        (
            end.getTime() -
            start.getTime()
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )

    ) + 1;
}


// ============================================================
// GET LEAVE TYPES
// ============================================================

export const listLeaveTypes = async (
    req,
    res
) => {

    try {

        const leaveTypes =
            await getLeaveTypes();

        return res.status(200).json({
            data: leaveTypes
        });

    } catch (error) {

        console.error(
            "listLeaveTypes error:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to retrieve leave types."
        });

    }

};


// ============================================================
// GET LEAVE BALANCES
// ============================================================

export const listLeaveBalances = async (
    req,
    res
) => {

    try {

        const employeeId =
            req.user.employeeId;

        const balances =
            await getLeaveBalances(
                employeeId
            );

        return res.status(200).json({
            data: balances
        });

    } catch (error) {

        console.error(
            "listLeaveBalances error:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to retrieve leave balances."
        });

    }

};


// ============================================================
// GET LEAVE REQUESTS
// ============================================================

export const listLeaveRequests = async (
    req,
    res
) => {

    try {

        const employeeId =
            req.user.employeeId;

        const requests =
            await getLeaveRequests(
                employeeId
            );

        return res.status(200).json({
            data: requests
        });

    } catch (error) {

        console.error(
            "listLeaveRequests error:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to retrieve leave requests."
        });

    }

};


// ============================================================
// SUBMIT LEAVE REQUEST
// ============================================================

export const submitLeaveRequest = async (
    req,
    res
) => {

    try {

        const employeeId =
            req.user.employeeId;


        const {
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason
        } = req.body;


        // -----------------------------------------------------
        // Required values
        // -----------------------------------------------------

        if (!leaveTypeId) {

            return res.status(400).json({
                message:
                    "Please select a leave type."
            });

        }


        if (!startDate) {

            return res.status(400).json({
                message:
                    "Start date is required."
            });

        }


        if (!endDate) {

            return res.status(400).json({
                message:
                    "End date is required."
            });

        }


        if (
            totalDays === undefined ||
            totalDays === null ||
            totalDays === ""
        ) {

            return res.status(400).json({
                message:
                    "Total leave days are required."
            });

        }


        const requestedDays =
            Number(
                totalDays
            );


        if (
            !Number.isInteger(
                requestedDays
            ) ||
            requestedDays < 1
        ) {

            return res.status(400).json({
                message:
                    "Leave days must be a whole number of at least 1."
            });

        }


        // -----------------------------------------------------
        // Validate dates
        // -----------------------------------------------------

        const calculatedDays =
            calculateDays(
                startDate,
                endDate
            );


        if (
            calculatedDays === null
        ) {

            return res.status(400).json({
                message:
                    "Please enter a valid leave date range."
            });

        }


        // -----------------------------------------------------
        // Make sure entered days match dates
        // -----------------------------------------------------

        if (
            requestedDays !==
            calculatedDays
        ) {

            return res.status(400).json({

                message:
                    `The selected dates equal ${calculatedDays} day(s), but ${requestedDays} day(s) were requested.`

            });

        }


        // -----------------------------------------------------
        // Validate leave type
        // -----------------------------------------------------

        const leaveType =
            await getLeaveTypeById(
                leaveTypeId
            );


        if (!leaveType) {

            return res.status(400).json({
                message:
                    "Invalid or inactive leave type."
            });

        }


        // -----------------------------------------------------
        // Get current balance
        // -----------------------------------------------------

        const balance =
            await getLeaveBalanceByType(
                employeeId,
                leaveTypeId
            );


        if (!balance) {

            return res.status(400).json({

                message:
                    `No current-year balance exists for ${leaveType.leaveTypeName}.`

            });

        }


        const remainingDays =
            Number(
                balance.remainingDays
            );


        if (
            requestedDays >
            remainingDays
        ) {

            return res.status(400).json({

                message:
                    `You only have ${remainingDays} day(s) of ${leaveType.leaveTypeName} remaining.`

            });

        }


        // -----------------------------------------------------
        // Check overlapping requests
        // -----------------------------------------------------

        const overlapping =
            await hasOverlappingLeave({

                employeeId,

                startDate,

                endDate

            });


        if (overlapping) {

            return res.status(409).json({

                message:
                    "You already have a pending or approved leave request covering these dates."

            });

        }


        // -----------------------------------------------------
        // SAVE REQUEST
        // -----------------------------------------------------

        const result =
            await createLeaveRequest({

                employeeId,

                leaveTypeId:
                    Number(
                        leaveTypeId
                    ),

                startDate,

                endDate,

                totalDays:
                    requestedDays,

                reason

            });


        // =====================================================
        // NOTIFY HR
        // =====================================================

        await createForRole({

            roleName:
                "hr",

            notificationType:
                "leave",

            title:
                "New Leave Request",

            message:
                `A new ${leaveType.leaveTypeName} request has been submitted by employee ${employeeId}.`,

            status:
                "New"

        });


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return res.status(201).json({

            message:
                "Leave request submitted successfully.",

            data: {

                leaveRequestId:
                    result.insertId,

                employeeId,

                leaveTypeId:
                    Number(
                        leaveTypeId
                    ),

                leaveTypeName:
                    leaveType.leaveTypeName,

                startDate,

                endDate,

                totalDays:
                    requestedDays,

                reason:
                    reason || null,

                status:
                    "Pending"

            }

        });

    } catch (error) {

        console.error(
            "submitLeaveRequest error:",
            error
        );

        return res.status(500).json({

            error:
                "Failed to submit leave request."

        });

    }

};
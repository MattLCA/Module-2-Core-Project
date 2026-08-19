import {
    getLeaveTypes,
    getLeaveBalances,
    getLeaveRequests,
    getLeaveTypeById,
    createLeaveRequest,
    hasOverlappingLeave
} from '../../models/worker/leaveModel.js';


// ============================================================
// HELPER — CALCULATE NUMBER OF DAYS
// ============================================================

const calculateDays = (startDate, endDate) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const difference =
        end.getTime() - start.getTime();

    return Math.floor(
        difference / (1000 * 60 * 60 * 24)
    ) + 1;
};


// ============================================================
// GET LEAVE TYPES
// ============================================================
//
// GET /api/worker/leave/types
//
// ============================================================

export const listLeaveTypes = async (req, res) => {
    try {
        const leaveTypes = await getLeaveTypes();

        res.status(200).json({
            data: leaveTypes
        });

    } catch (error) {
        console.error('listLeaveTypes error:', error);

        res.status(500).json({
            error: 'Failed to retrieve leave types.'
        });
    }
};


// ============================================================
// GET LEAVE BALANCES
// ============================================================
//
// GET /api/worker/leave/balances
//
// ============================================================

export const listLeaveBalances = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const balances = await getLeaveBalances(employeeId);

        res.status(200).json({
            data: balances
        });

    } catch (error) {
        console.error('listLeaveBalances error:', error);

        res.status(500).json({
            error: 'Failed to retrieve leave balances.'
        });
    }
};


// ============================================================
// GET LEAVE REQUESTS
// ============================================================
//
// GET /api/worker/leave/requests
//
// ============================================================

export const listLeaveRequests = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const requests = await getLeaveRequests(employeeId);

        res.status(200).json({
            data: requests
        });

    } catch (error) {
        console.error('listLeaveRequests error:', error);

        res.status(500).json({
            error: 'Failed to retrieve leave requests.'
        });
    }
};


// ============================================================
// SUBMIT LEAVE REQUEST
// ============================================================
//
// POST /api/worker/leave/requests
//
// Expected body:
//
// {
//     "leaveTypeId": 1,
//     "startDate": "2026-08-25",
//     "endDate": "2026-08-27",
//     "reason": "Family trip"
// }
//
// ============================================================

export const submitLeaveRequest = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const {
            leaveTypeId,
            startDate,
            endDate,
            reason
        } = req.body;


        // --------------------------------------------------------
        // REQUIRED FIELDS
        // --------------------------------------------------------

        if (!leaveTypeId) {
            return res.status(400).json({
                message: 'Leave type is required.'
            });
        }

        if (!startDate) {
            return res.status(400).json({
                message: 'Start date is required.'
            });
        }

        if (!endDate) {
            return res.status(400).json({
                message: 'End date is required.'
            });
        }


        // --------------------------------------------------------
        // VALIDATE DATES
        // --------------------------------------------------------

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                message: 'Invalid leave dates.'
            });
        }


        if (end < start) {
            return res.status(400).json({
                message: 'End date cannot be before start date.'
            });
        }


        // --------------------------------------------------------
        // CALCULATE TOTAL DAYS
        // --------------------------------------------------------

        const totalDays = calculateDays(
            startDate,
            endDate
        );


        if (totalDays <= 0) {
            return res.status(400).json({
                message: 'Leave must be at least one day.'
            });
        }


        // --------------------------------------------------------
        // CHECK LEAVE TYPE
        // --------------------------------------------------------

        const leaveType = await getLeaveTypeById(
            leaveTypeId
        );

        if (!leaveType) {
            return res.status(400).json({
                message: 'Invalid or inactive leave type.'
            });
        }


        // --------------------------------------------------------
        // CHECK OVERLAPPING REQUESTS
        // --------------------------------------------------------

        const overlapping = await hasOverlappingLeave({
            employeeId,
            startDate,
            endDate
        });

        if (overlapping) {
            return res.status(409).json({
                message:
                    'You already have a pending or approved leave request covering these dates.'
            });
        }


        // --------------------------------------------------------
        // CREATE REQUEST
        // --------------------------------------------------------

        const result = await createLeaveRequest({
            employeeId,
            leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason
        });


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.status(201).json({
            message: 'Leave request submitted successfully.',
            data: {
                leaveRequestId: result.insertId,
                employeeId,
                leaveTypeId: Number(leaveTypeId),
                startDate,
                endDate,
                totalDays,
                reason: reason || null,
                status: 'Pending'
            }
        });

    } catch (error) {
        console.error('submitLeaveRequest error:', error);

        res.status(500).json({
            error: 'Failed to submit leave request.'
        });
    }
};
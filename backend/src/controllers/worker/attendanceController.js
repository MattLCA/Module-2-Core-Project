import {
    getActiveAttendance,
    createClockIn,
    updateBreakStart,
    updateBreakEnd,
    updateClockOut,
    getHistoryByEmployeeId
} from '../../models/worker/attendanceModel.js';


// ============================================================
// GET CURRENT CLOCK STATUS
// ============================================================

export const getClockStatus = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.status(200).json({
                isClockedIn: false,
                state: 'CLOCKED_OUT',
                activeRecord: null
            });
        }

        let state = 'WORKING';

        if (activeRecord.breakStart && !activeRecord.breakEnd) {
            state = 'ON_BREAK';
        }

        return res.status(200).json({
            isClockedIn: true,
            state,
            activeRecord
        });

    } catch (error) {
        console.error('getClockStatus error:', error);

        return res.status(500).json({
            error: 'Failed to retrieve clock status.'
        });
    }
};


// ============================================================
// CLOCK IN
// ============================================================

export const clockIn = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const existing = await getActiveAttendance(employeeId);

        if (existing) {
            return res.status(400).json({
                message: 'You are already clocked in.'
            });
        }

        await createClockIn(employeeId);

        return res.status(201).json({
            message: 'Clocked in successfully.'
        });

    } catch (error) {
        console.error('clockIn error:', error);

        return res.status(500).json({
            error: 'Failed to clock in.'
        });
    }
};


// ============================================================
// START BREAK
// ============================================================

export const startBreak = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.status(400).json({
                message: 'You must clock in before starting a break.'
            });
        }

        if (activeRecord.breakStart && !activeRecord.breakEnd) {
            return res.status(400).json({
                message: 'Your break has already started.'
            });
        }

        if (activeRecord.clockOut) {
            return res.status(400).json({
                message: 'You have already clocked out.'
            });
        }

        const result = await updateBreakStart(
            activeRecord.attendanceId
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Unable to start break.'
            });
        }

        return res.status(200).json({
            message: 'Break started successfully.'
        });

    } catch (error) {
        console.error('startBreak error:', error);

        return res.status(500).json({
            error: 'Failed to start break.'
        });
    }
};


// ============================================================
// END BREAK
// ============================================================

export const endBreak = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.status(400).json({
                message: 'No active clock-in session found.'
            });
        }

        if (!activeRecord.breakStart) {
            return res.status(400).json({
                message: 'You have not started a break.'
            });
        }

        if (activeRecord.breakEnd) {
            return res.status(400).json({
                message: 'Your break has already ended.'
            });
        }

        const result = await updateBreakEnd(
            activeRecord.attendanceId
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Unable to end break.'
            });
        }

        return res.status(200).json({
            message: 'Break ended successfully.'
        });

    } catch (error) {
        console.error('endBreak error:', error);

        return res.status(500).json({
            error: 'Failed to end break.'
        });
    }
};


// ============================================================
// CLOCK OUT
// ============================================================

export const clockOut = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.status(400).json({
                message: 'No active clock-in session found.'
            });
        }

        if (activeRecord.breakStart && !activeRecord.breakEnd) {
            return res.status(400).json({
                message: 'Please end your break before clocking out.'
            });
        }

        if (activeRecord.clockOut) {
            return res.status(400).json({
                message: 'You have already clocked out.'
            });
        }

        const result = await updateClockOut(
            activeRecord.attendanceId
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Unable to clock out.'
            });
        }

        return res.status(200).json({
            message: 'Clocked out successfully.'
        });

    } catch (error) {
        console.error('clockOut error:', error);

        return res.status(500).json({
            error: 'Failed to clock out.'
        });
    }
};


// ============================================================
// ATTENDANCE HISTORY
// ============================================================

export const getAttendanceHistory = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const history =
            await getHistoryByEmployeeId(employeeId);

        return res.status(200).json({
            data: history
        });

    } catch (error) {
        console.error('getAttendanceHistory error:', error);

        return res.status(500).json({
            error: 'Failed to retrieve attendance history.'
        });
    }
};
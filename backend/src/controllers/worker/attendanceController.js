import {
    getActiveAttendance,
    createClockIn,
    updateBreakStart,
    updateBreakEnd,
    updateClockOut,
    getHistoryByEmployeeId
} from '../../models/worker/attendanceModel.js';


// 1. Get current clock status when the page loads
export const getClockStatus = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.json({
                isClockedIn: false,
                activeRecord: null
            });
        }

        res.json({
            isClockedIn: true,
            activeRecord
        });

    } catch (error) {
        console.error('getClockStatus error:', error);
        res.status(500).json({
            error: 'Failed to retrieve clock status.'
        });
    }
};


// 2. Clock In
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

        res.status(201).json({
            message: 'Clocked in successfully.'
        });

    } catch (error) {
        console.error('clockIn error:', error);
        res.status(500).json({
            error: 'Failed to clock in.'
        });
    }
};


// 3. Start Break
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

        await updateBreakStart(activeRecord.attendanceId);

        res.json({
            message: 'Break started successfully.'
        });

    } catch (error) {
        console.error('startBreak error:', error);
        res.status(500).json({
            error: 'Failed to start break.'
        });
    }
};


// 4. End Break
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

        await updateBreakEnd(activeRecord.attendanceId);

        res.json({
            message: 'Break ended successfully.'
        });

    } catch (error) {
        console.error('endBreak error:', error);
        res.status(500).json({
            error: 'Failed to end break.'
        });
    }
};


// 5. Clock Out
export const clockOut = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.status(400).json({
                message: 'No active clock-in session found.'
            });
        }

        await updateClockOut(activeRecord.attendanceId);

        res.json({
            message: 'Clocked out successfully.'
        });

    } catch (error) {
        console.error('clockOut error:', error);
        res.status(500).json({
            error: 'Failed to clock out.'
        });
    }
};


// 6. Get Attendance History
export const getAttendanceHistory = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const history = await getHistoryByEmployeeId(employeeId);

        res.json(history);

    } catch (error) {
        console.error('getAttendanceHistory error:', error);
        res.status(500).json({
            error: 'Failed to retrieve attendance history.'
        });
    }
};
import {
    getActiveAttendance,
    createClockIn,
    updateClockOut,
    getHistoryByEmployeeId
} from '../../models/worker/attendanceModel.js';


// Get current clock state on page load
export const getClockStatus = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.json({ isClockedIn: false, activeRecord: null });
        }
        res.json({ isClockedIn: true, activeRecord });
    } catch (error) {
        console.error('getClockStatus error:', error);
        res.status(500).json({ error: 'Failed to retrieve clock status' });
    }
};


// Clock In Action
export const clockIn = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const existing = await getActiveAttendance(employeeId);

        if (existing) {
            return res.status(400).json({ message: 'You are already clocked in.' });
        }

        await createClockIn(employeeId);
        res.status(201).json({ message: 'Clocked in successfully.' });
    } catch (error) {
        console.error('clockIn error:', error);
        res.status(500).json({ error: 'Failed too clock in' });
    }
};


// Clock Out Action
export const clockOut = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const activeRecord = await getActiveAttendance(employeeId);

        if (!activeRecord) {
            return res.status(400).json({ message: 'No active clock-in session found.' });
        }
        
        await updateClockOut(activeRecord.attendanceId);
        res.json({ message: 'Clocked out successfully.' });
    } catch (error) {
        console.error('clockOut error:', error);
        res.status(500).json({ error: 'Failed to clock out.' });
    }
};


// Attendance History Table Data
export const getAttendanceHistory = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        const history = await getHistoryByEmployeeId(employeeId);
        res.json(history);
    } catch (error) {
        console.error('getAttendanceHistory error:', error);
        res.status(500).json({ error: 'Failed to retrieve attendance history '});
    }
};
// src/controllers/worker/attendanceController.js
const attendanceModel = require('../../models/worker/attendanceModel');

exports.clockIn = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        // check if user is already clocked in
        const activeSession = await attendanceModel.findActiveClockIn(employeeId);
        if (activeSession) {
            return res.status(400).json({ message: 'You are already clocked in for today.'});
        }

        // call model to insert new row
        await attendanceModel.createClockIn(employeeId);

        return res.status(201).json({ message: 'Clocked in successfully!'});
    }   catch (error) {
        console.error('Clock-in Controller Error:', error);
        return res.status(500).json({ message: 'Server error during clock-in.' });
    }
};
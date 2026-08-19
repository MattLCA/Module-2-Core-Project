import * as leaveModel from '../../models/worker/leaveModel.js';

export const getLeaveBalances = async (req, res) => {
    try {
        const balances = await leaveModel.getLeaveBalancesByEmployeeId(req.user.employeeId);
        res.json(balances);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave balances.' });
    }
};


export const applyForLeave = async (req, res) => {
    try {
        const { leaveTypeId, startDate, endDate, reason } = req.body;
        if (!leaveTypeId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required leave fields.' });
        }

        await leaveModel.createLeaveRequest(req.user.employeeId, { leaveTypeId, startDate, endDate, reason });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit leave request' });
    }
};
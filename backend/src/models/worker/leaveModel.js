import pool from '../../config/db.js';


// 1. GET leave balances for an employee
export const getLeaveBalancesByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT employeeLeaveBalances.balanceId,
                leaveTypes.leaveTypeName,
                employeeLeaveBalances.allocatedDays,
                employeeLeaveBalances.usedDays,
                (employeeLeaveBalances.allocatedDays - employeeLeaveBalances.usedDays) AS remainingDays
        FROM employeeLeaveBalances
        JOIN leaveTypes
            ON employeeLeaveBalances.leaveTypeId = leaveTypes.leaveTypeId
        WHERE employeeLeaveBalances.employeeId = ?`,
        [employeeId]
    );
    return rows;
};


// 2. CREATE a new leave request
export const createLeaveRequest = async (
    employeeId,
    { leaveTypeId, startDate, endDate, reason }
) => {
    const [result] = await pool.query(
        `INSERT INTO leaveRequests
            (employeeId, leaveTypeId, startDate, endDate, reason, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [employeeId, leaveTypeId, startDate, endDate, reason]
    );
    return result;
};


// 3. GET leave request history for an employee
export const getLeaveHistoryByEmployeeId = async (employeeId) => {
    const [rows] = await pool.query(
        `SELECT leaveRequests.leaveId,
                leaveTypes.leaveTypeName,
                leaveRequests.startDate,
                leaveRequests.endDate,
                leaveRequests.reason,
                leaveRequests.status,
                leaveRequests.createdAt
        FROM leaveRequests
        JOIN leaveTypes
            ON leaveRequests.leaveTypeId = leaveTypes.leaveTypeId
        WHERE leaveRequests.employeeId = ?
        ORDER BY leaveRequests.createdAt DESC`,
        [employeeId]
    );
    return rows;
};
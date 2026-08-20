// ============================================================
// ModernTech Worker Portal API
// ============================================================
// Shared API functions for the Worker Portal.
// ============================================================

const WORKER_API_BASE_URL = 'http://localhost:4000/api';


// ============================================================
// TOKEN HELPERS
// ============================================================

function getWorkerToken() {
    return localStorage.getItem('token');
}


function saveWorkerToken(token) {
    if (!token) {
        return;
    }

    localStorage.setItem('token', token);
}


function clearWorkerToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');

    // Clean up older token names if they exist.
    localStorage.removeItem('workerToken');
    localStorage.removeItem('authToken');
}


// ============================================================
// LOGGED-IN EMPLOYEE
// ============================================================

function getLoggedInWorker() {
    const employee = localStorage.getItem('employee');

    if (!employee) {
        return null;
    }

    try {
        return JSON.parse(employee);
    } catch (error) {
        console.error(
            'Could not parse stored employee:',
            error
        );

        return null;
    }
}


function saveLoggedInWorker(employee) {
    if (!employee) {
        return;
    }

    localStorage.setItem(
        'employee',
        JSON.stringify(employee)
    );
}


// ============================================================
// AUTHENTICATED API REQUEST
// ============================================================

async function workerApiRequest(endpoint, options = {}) {

    const token = getWorkerToken();

    const config = {
        ...options,

        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    };

    // Add JWT authentication.
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${WORKER_API_BASE_URL}${endpoint}`,
        config
    );

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    if (!response.ok) {

        const errorMessage =
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`;

        // JWT expired/invalid.
        if (response.status === 401) {
            clearWorkerToken();

            window.location.href = 'index.html';

            return;
        }

        throw new Error(errorMessage);
    }

    return data;
}


// ============================================================
// AUTHENTICATION
// ============================================================

async function workerLogin(employeeCode, password) {

    const response = await workerApiRequest(
        '/auth/login',
        {
            method: 'POST',

            body: JSON.stringify({
                role: 'worker',
                identifier: employeeCode,
                password: password
            })
        }
    );

    // Save JWT.
    if (response?.data?.token) {
        saveWorkerToken(
            response.data.token
        );
    }

    // Save employee.
    if (response?.data?.employee) {
        saveLoggedInWorker(
            response.data.employee
        );
    }

    return response;
}


// ============================================================
// LOGOUT
// ============================================================

async function workerLogout() {

    clearWorkerToken();

    window.location.href = 'index.html';
}


// ============================================================
// WORKER DASHBOARD
// ============================================================

async function getWorkerDashboard() {

    return await workerApiRequest(
        '/worker/dashboard'
    );
}


// ============================================================
// WORKER PROFILE
// ============================================================

async function getWorkerProfile() {

    return await workerApiRequest(
        '/worker/profile'
    );
}


async function updateWorkerProfile(profileData) {

    return await workerApiRequest(
        '/worker/profile',
        {
            method: 'PUT',

            body: JSON.stringify(
                profileData
            )
        }
    );
}


// ============================================================
// WORKER ATTENDANCE
// ============================================================

async function getWorkerAttendance() {

    return await workerApiRequest(
        '/worker/attendance'
    );
}


async function workerClockIn() {

    return await workerApiRequest(
        '/worker/attendance/clock-in',
        {
            method: 'POST'
        }
    );
}


async function workerClockOut() {

    return await workerApiRequest(
        '/worker/attendance/clock-out',
        {
            method: 'POST'
        }
    );
}


// ============================================================
// WORKER LEAVE
// ============================================================

async function getWorkerLeaveRequests() {

    return await workerApiRequest(
        '/worker/leave'
    );
}


async function createWorkerLeaveRequest(
    leaveData
) {

    return await workerApiRequest(
        '/worker/leave',
        {
            method: 'POST',

            body: JSON.stringify(
                leaveData
            )
        }
    );
}


async function updateWorkerLeaveRequest(
    leaveId,
    leaveData
) {

    return await workerApiRequest(
        `/worker/leave/${leaveId}`,
        {
            method: 'PUT',

            body: JSON.stringify(
                leaveData
            )
        }
    );
}


async function deleteWorkerLeaveRequest(
    leaveId
) {

    return await workerApiRequest(
        `/worker/leave/${leaveId}`,
        {
            method: 'DELETE'
        }
    );
}


// ============================================================
// WORKER PAYSLIPS
// ============================================================

async function getWorkerPayslips() {

    return await workerApiRequest(
        '/worker/payslips'
    );
}


async function getWorkerPayslip(
    payslipId
) {

    return await workerApiRequest(
        `/worker/payslips/${payslipId}`
    );
}


// ============================================================
// WORKER NOTIFICATIONS
// ============================================================

// Get all notifications.
async function getWorkerNotifications() {

    return await workerApiRequest(
        '/worker/notifications'
    );
}


// Get unread notifications.
async function getUnreadWorkerNotifications() {

    return await workerApiRequest(
        '/worker/notifications/unread'
    );
}


// Get unread notification count.
async function getUnreadWorkerNotificationCount() {

    return await workerApiRequest(
        '/worker/notifications/unread-count'
    );
}


// Get one notification.
async function getWorkerNotification(
    notificationId
) {

    return await workerApiRequest(
        `/worker/notifications/${notificationId}`
    );
}


// Mark one notification as read.
async function markWorkerNotificationAsRead(
    notificationId
) {

    return await workerApiRequest(
        `/worker/notifications/${notificationId}/read`,
        {
            method: 'PATCH'
        }
    );
}


// Mark all notifications as read.
async function markAllWorkerNotificationsAsRead() {

    return await workerApiRequest(
        '/worker/notifications/read-all',
        {
            method: 'PATCH'
        }
    );
}


// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

function isWorkerLoggedIn() {

    return Boolean(
        getWorkerToken()
    );
}


function requireWorkerLogin() {

    if (!isWorkerLoggedIn()) {

        window.location.href =
            'index.html';

        return false;
    }

    return true;
}
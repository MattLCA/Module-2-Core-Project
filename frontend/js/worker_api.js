// ============================================================
// ModernTech Worker Portal API
// Connects the worker frontend to the Node/Express backend
// ============================================================

const WORKER_API_BASE_URL = 'http://localhost:4000/api';

/**
 * Get the JWT token saved after worker login.
 */
function getWorkerToken() {
    return localStorage.getItem('token');
}

/**
 * Save the JWT token after successful login.
 */
function saveWorkerToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Remove the worker's JWT token.
 */
function clearWorkerToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
}

/**
 * Get the currently logged-in employee.
 */
function getLoggedInWorker() {
    const employee = localStorage.getItem('employee');

    if (!employee) {
        return null;
    }

    try {
        return JSON.parse(employee);
    } catch (error) {
        console.error('Could not parse stored employee:', error);
        return null;
    }
}

/**
 * Save employee information returned by the login API.
 */
function saveLoggedInWorker(employee) {
    localStorage.setItem('employee', JSON.stringify(employee));
}

/**
 * Make an authenticated request to the worker API.
 *
 * @param {string} endpoint - API endpoint beginning with /
 * @param {object} options - fetch options
 * @returns {Promise<object>}
 */
async function workerApiRequest(endpoint, options = {}) {
    const token = getWorkerToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    };

    // Add JWT authentication if we have a token.
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${WORKER_API_BASE_URL}${endpoint}`,
        config
    );

    // Try to read the JSON response.
    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        // Response did not contain JSON.
        data = null;
    }

    // Handle unsuccessful HTTP responses.
    if (!response.ok) {
        const errorMessage =
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`;

        // If the JWT is invalid/expired, clear it.
        if (response.status === 401) {
            clearWorkerToken();
        }

        throw new Error(errorMessage);
    }

    return data;
}


// ============================================================
// AUTHENTICATION
// ============================================================

/**
 * Login a worker.
 *
 * @param {string} employeeCode
 * @param {string} password
 * @returns {Promise<object>}
 */
async function workerLogin(employeeCode, password) {
    const response = await workerApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            role: 'worker',
            identifier: employeeCode,
            password: password
        })
    });

    // Save JWT and employee information.
    if (response?.data?.token) {
        saveWorkerToken(response.data.token);
    }

    if (response?.data?.employee) {
        saveLoggedInWorker(response.data.employee);
    }

    return response;
}


/**
 * Logout the worker.
 */
function workerLogout() {
    clearWorkerToken();

    window.location.href = 'index.html';
}


// ============================================================
// WORKER DASHBOARD
// ============================================================

/**
 * Get worker dashboard information.
 */
async function getWorkerDashboard() {
    return await workerApiRequest('/worker/dashboard');
}


// ============================================================
// WORKER PROFILE
// ============================================================

/**
 * Get the logged-in worker's profile.
 */
async function getWorkerProfile() {
    return await workerApiRequest('/worker/profile');
}


/**
 * Update the logged-in worker's profile.
 *
 * @param {object} profileData
 */
async function updateWorkerProfile(profileData) {
    return await workerApiRequest('/worker/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
}


// ============================================================
// WORKER ATTENDANCE
// ============================================================

/**
 * Get the logged-in worker's attendance records.
 */
async function getWorkerAttendance() {
    return await workerApiRequest('/worker/attendance');
}


/**
 * Clock in the logged-in worker.
 */
async function workerClockIn() {
    return await workerApiRequest('/worker/attendance/clock-in', {
        method: 'POST'
    });
}


/**
 * Clock out the logged-in worker.
 */
async function workerClockOut() {
    return await workerApiRequest('/worker/attendance/clock-out', {
        method: 'POST'
    });
}


// ============================================================
// WORKER LEAVE
// ============================================================

/**
 * Get the logged-in worker's leave requests.
 */
async function getWorkerLeaveRequests() {
    return await workerApiRequest('/worker/leave');
}


/**
 * Submit a new leave request.
 *
 * @param {object} leaveData
 */
async function createWorkerLeaveRequest(leaveData) {
    return await workerApiRequest('/worker/leave', {
        method: 'POST',
        body: JSON.stringify(leaveData)
    });
}


/**
 * Update a leave request.
 *
 * @param {number|string} leaveId
 * @param {object} leaveData
 */
async function updateWorkerLeaveRequest(leaveId, leaveData) {
    return await workerApiRequest(`/worker/leave/${leaveId}`, {
        method: 'PUT',
        body: JSON.stringify(leaveData)
    });
}


/**
 * Cancel/delete a leave request.
 *
 * @param {number|string} leaveId
 */
async function deleteWorkerLeaveRequest(leaveId) {
    return await workerApiRequest(`/worker/leave/${leaveId}`, {
        method: 'DELETE'
    });
}


// ============================================================
// WORKER PAYSLIPS
// ============================================================

/**
 * Get the logged-in worker's payslips.
 */
async function getWorkerPayslips() {
    return await workerApiRequest('/worker/payslips');
}


/**
 * Get one specific payslip.
 *
 * @param {number|string} payslipId
 */
async function getWorkerPayslip(payslipId) {
    return await workerApiRequest(`/worker/payslips/${payslipId}`);
}


// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

/**
 * Check whether a worker is currently logged in.
 */
function isWorkerLoggedIn() {
    return Boolean(getWorkerToken());
}


/**
 * Require the worker to be logged in.
 *
 * If no JWT exists, redirect to login.
 */
function requireWorkerLogin() {
    if (!isWorkerLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }

    return true;
}
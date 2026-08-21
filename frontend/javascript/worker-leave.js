// ============================================================
// ModernTech Worker Leave
// ============================================================
// Connects the employee leave page to the backend.
//
// Backend endpoints:
// GET  /api/worker/leave/types
// GET  /api/worker/leave/balances
// GET  /api/worker/leave/requests
// POST /api/worker/leave/requests
//
// Authentication:
// worker_api.js supplies:
// Authorization: Bearer <JWT>
// ============================================================

console.log("Worker Leave JS connected.");


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing worker leave page...");

    // Make sure the worker has a JWT.
    if (typeof requireWorkerLogin === "function") {
        if (!requireWorkerLogin()) {
            return;
        }
    }

    // Display employee information immediately if available.
    if (typeof initializeStoredEmployee === "function") {
        initializeStoredEmployee();
    }

    // Load the actual employee profile from the backend.
    await loadLeaveEmployee();

    // Load leave information.
    await loadLeaveTypes();
    await loadLeaveBalances();
    await loadLeaveRequests();

    // Set up the leave request form.
    initializeLeaveForm();
});


// ============================================================
// EMPLOYEE INFORMATION
// ============================================================

async function loadLeaveEmployee() {
    try {
        if (typeof getWorkerProfile !== "function") {
            console.warn("getWorkerProfile() is unavailable.");
            return;
        }

        const response = await getWorkerProfile();

        console.log("Worker profile response:", response);

        const employee =
            response?.data?.employee ||
            response?.data ||
            response?.employee ||
            response;

        if (!employee) {
            return;
        }

        // Save the latest employee returned by the backend.
        if (typeof saveLoggedInWorker === "function") {
            saveLoggedInWorker(employee);
        }

        // Update sidebar.
        if (typeof updateSidebarEmployee === "function") {
            updateSidebarEmployee(employee);
        }

    } catch (error) {
        console.error("Could not load worker profile:", error);

        // Do NOT automatically redirect here.
        // A profile failure should not destroy a valid login session.
    }
}


// ============================================================
// LEAVE TYPES
// ============================================================

async function loadLeaveTypes() {
    try {
        if (typeof getWorkerLeaveTypes !== "function") {
            console.warn(
                "getWorkerLeaveTypes() is unavailable."
            );
            return;
        }

        const response = await getWorkerLeaveTypes();

        console.log("Leave types response:", response);

        const types =
            response?.data?.leaveTypes ||
            response?.data?.types ||
            response?.leaveTypes ||
            response?.types ||
            response?.data ||
            response;

        if (!Array.isArray(types)) {
            console.warn("Leave types response was not an array.");
            return;
        }

        populateLeaveTypeSelect(types);

    } catch (error) {
        console.error("Could not load leave types:", error);

        showLeaveMessage(
            error.message || "Could not load leave types.",
            "error"
        );
    }
}


// ============================================================
// POPULATE LEAVE TYPE SELECT
// ============================================================

function populateLeaveTypeSelect(types) {
    const select =
        document.getElementById("leaveType") ||
        document.getElementById("leave-type") ||
        document.querySelector(
            'select[name="leave_type"]'
        ) ||
        document.querySelector(
            'select[name="leaveType"]'
        );

    if (!select) {
        console.warn(
            "Leave type select element was not found."
        );
        return;
    }

    select.innerHTML = `
        <option value="">Select leave type</option>
    `;

    types.forEach((type) => {
        const option = document.createElement("option");

        const id =
            type.id ??
            type.leave_type_id ??
            type.leaveTypeId;

        const name =
            type.name ??
            type.leave_type_name ??
            type.leaveTypeName ??
            type.type ??
            "Leave";

        option.value = id;
        option.textContent = name;

        select.appendChild(option);
    });
}


// ============================================================
// LEAVE BALANCES
// ============================================================

async function loadLeaveBalances() {
    try {
        if (typeof getWorkerLeaveBalances !== "function") {
            console.warn(
                "getWorkerLeaveBalances() is unavailable."
            );
            return;
        }

        const response =
            await getWorkerLeaveBalances();

        console.log(
            "Leave balances response:",
            response
        );

        const balances =
            response?.data?.balances ||
            response?.balances ||
            response?.data ||
            response;

        if (!Array.isArray(balances)) {
            console.warn(
                "Leave balances response was not an array."
            );
            return;
        }

        renderLeaveBalances(balances);

    } catch (error) {
        console.error(
            "Could not load leave balances:",
            error
        );
    }
}


// ============================================================
// RENDER LEAVE BALANCES
// ============================================================

function renderLeaveBalances(balances) {
    /*
     * Try to find an existing balance container.
     * This supports several possible IDs used by the frontend.
     */

    const container =
        document.getElementById("leaveBalances") ||
        document.getElementById("leaveBalanceList") ||
        document.getElementById("leave-balance-list");

    if (!container) {
        console.warn(
            "Leave balance container was not found."
        );
        return;
    }

    if (balances.length === 0) {
        container.innerHTML = `
            <p class="empty-state">
                No leave balances available.
            </p>
        `;
        return;
    }

    container.innerHTML = "";

    balances.forEach((balance) => {
        const leaveName =
            balance.leave_type_name ||
            balance.leaveTypeName ||
            balance.name ||
            balance.leave_type ||
            "Leave";

        const available =
            balance.available_days ??
            balance.remaining_days ??
            balance.balance ??
            balance.days_remaining ??
            0;

        const used =
            balance.used_days ??
            balance.days_used ??
            0;

        const total =
            balance.total_days ??
            balance.entitlement ??
            balance.allocated_days ??
            Number(available) + Number(used);

        const item = document.createElement("div");

        item.className = "leave-balance-item";

        item.innerHTML = `
            <div class="leave-balance-info">
                <strong>${escapeHtml(leaveName)}</strong>
                <span>
                    ${escapeHtml(String(available))} days available
                </span>
            </div>

            <div class="leave-balance-value">
                ${escapeHtml(String(available))}
                <small>/ ${escapeHtml(String(total))}</small>
            </div>
        `;

        container.appendChild(item);
    });
}


// ============================================================
// LEAVE REQUESTS
// ============================================================

async function loadLeaveRequests() {
    try {
        if (typeof getWorkerLeaveRequests !== "function") {
            console.warn(
                "getWorkerLeaveRequests() is unavailable."
            );
            return;
        }

        const response =
            await getWorkerLeaveRequests();

        console.log(
            "Leave requests response:",
            response
        );

        const requests =
            response?.data?.requests ||
            response?.data?.leaveRequests ||
            response?.requests ||
            response?.leaveRequests ||
            response?.data ||
            response;

        if (!Array.isArray(requests)) {
            console.warn(
                "Leave requests response was not an array."
            );
            return;
        }

        renderLeaveRequests(requests);

    } catch (error) {
        console.error(
            "Could not load leave requests:",
            error
        );

        showLeaveMessage(
            error.message ||
            "Could not load your leave requests.",
            "error"
        );
    }
}


// ============================================================
// RENDER LEAVE REQUESTS
// ============================================================

function renderLeaveRequests(requests) {
    const tableBody =
        document.getElementById("leaveRequestsBody") ||
        document.getElementById("leaveRequestBody") ||
        document.getElementById("leaveRequests") ||
        document.querySelector(
            "#leaveRequestsTable tbody"
        );

    if (!tableBody) {
        console.warn(
            "Leave requests table body was not found."
        );
        return;
    }

    if (requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No leave requests found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = "";

    requests.forEach((request) => {
        const row = document.createElement("tr");

        const leaveType =
            request.leave_type_name ||
            request.leaveTypeName ||
            request.leave_type ||
            request.type ||
            "Leave";

        const startDate =
            request.start_date ||
            request.startDate ||
            request.from_date ||
            "";

        const endDate =
            request.end_date ||
            request.endDate ||
            request.to_date ||
            "";

        const days =
            request.days_requested ??
            request.number_of_days ??
            request.days ??
            calculateDays(startDate, endDate);

        const status =
            request.status ||
            "Pending";

        const reason =
            request.reason ||
            request.notes ||
            "-";

        row.innerHTML = `
            <td>
                ${escapeHtml(leaveType)}
            </td>

            <td>
                ${formatLeaveDate(startDate)}
            </td>

            <td>
                ${formatLeaveDate(endDate)}
            </td>

            <td>
                ${escapeHtml(String(days))}
            </td>

            <td>
                ${escapeHtml(reason)}
            </td>

            <td>
                <span class="status ${getStatusClass(status)}">
                    ${escapeHtml(formatStatus(status))}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ============================================================
// LEAVE REQUEST FORM
// ============================================================

function initializeLeaveForm() {
    const form =
        document.getElementById("leaveRequestForm") ||
        document.getElementById("leaveForm") ||
        document.querySelector(
            'form[data-form="leave"]'
        );

    if (!form) {
        console.warn(
            "Leave request form was not found."
        );
        return;
    }

    // Prevent duplicate event listeners.
    if (form.dataset.initialized === "true") {
        return;
    }

    form.dataset.initialized = "true";

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            await submitLeaveRequest(form);
        }
    );
}


// ============================================================
// SUBMIT LEAVE REQUEST
// ============================================================

async function submitLeaveRequest(form) {
    try {
        const leaveType =
            getFieldValue(
                form,
                [
                    "#leaveType",
                    "#leave-type",
                    '[name="leave_type"]',
                    '[name="leaveType"]'
                ]
            );

        const startDate =
            getFieldValue(
                form,
                [
                    "#startDate",
                    "#start-date",
                    '[name="start_date"]',
                    '[name="startDate"]'
                ]
            );

        const endDate =
            getFieldValue(
                form,
                [
                    "#endDate",
                    "#end-date",
                    '[name="end_date"]',
                    '[name="endDate"]'
                ]
            );

        const reason =
            getFieldValue(
                form,
                [
                    "#reason",
                    "#leaveReason",
                    '[name="reason"]',
                    '[name="notes"]'
                ]
            );

        // ----------------------------------------------------
        // Validation
        // ----------------------------------------------------

        if (!leaveType) {
            showLeaveMessage(
                "Please select a leave type.",
                "error"
            );
            return;
        }

        if (!startDate) {
            showLeaveMessage(
                "Please select a start date.",
                "error"
            );
            return;
        }

        if (!endDate) {
            showLeaveMessage(
                "Please select an end date.",
                "error"
            );
            return;
        }

        if (
            new Date(endDate) <
            new Date(startDate)
        ) {
            showLeaveMessage(
                "The end date cannot be before the start date.",
                "error"
            );
            return;
        }

        // ----------------------------------------------------
        // Find submit button
        // ----------------------------------------------------

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        let originalButtonText = null;

        if (submitButton) {
            originalButtonText =
                submitButton.innerHTML;

            submitButton.disabled = true;

            submitButton.innerHTML = `
                <span>Submitting...</span>
            `;
        }

        // ----------------------------------------------------
        // Build backend payload
        // ----------------------------------------------------

        const payload = {
            leave_type_id: Number(leaveType),
            start_date: startDate,
            end_date: endDate,
            reason: reason || null
        };

        console.log(
            "Submitting leave request:",
            payload
        );

        // ----------------------------------------------------
        // Send request
        // ----------------------------------------------------

        if (
            typeof createWorkerLeaveRequest !==
            "function"
        ) {
            throw new Error(
                "Leave API is unavailable."
            );
        }

        const response =
            await createWorkerLeaveRequest(
                payload
            );

        console.log(
            "Leave request created:",
            response
        );

        showLeaveMessage(
            "Leave request submitted successfully.",
            "success"
        );

        // ----------------------------------------------------
        // Reset form
        // ----------------------------------------------------

        form.reset();

        // ----------------------------------------------------
        // Refresh requests and balances
        // ----------------------------------------------------

        await loadLeaveRequests();
        await loadLeaveBalances();

        // ----------------------------------------------------
        // Restore button
        // ----------------------------------------------------

        if (submitButton) {
            submitButton.disabled = false;

            submitButton.innerHTML =
                originalButtonText;
        }

    } catch (error) {
        console.error(
            "Leave request submission failed:",
            error
        );

        showLeaveMessage(
            error.message ||
            "Could not submit leave request.",
            "error"
        );

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {
            submitButton.disabled = false;

            submitButton.innerHTML =
                "Submit Request";
        }
    }
}


// ============================================================
// FIELD HELPER
// ============================================================

function getFieldValue(form, selectors) {
    for (const selector of selectors) {
        const field =
            form.querySelector(selector);

        if (field) {
            return field.value.trim();
        }
    }

    return "";
}


// ============================================================
// DATE CALCULATION
// ============================================================

function calculateDays(startDate, endDate) {
    if (!startDate || !endDate) {
        return 0;
    }

    const start =
        new Date(startDate);

    const end =
        new Date(endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 0;
    }

    const difference =
        end.getTime() -
        start.getTime();

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1
    );
}


// ============================================================
// DATE FORMAT
// ============================================================

function formatLeaveDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    if (
        typeof formatDate ===
        "function"
    ) {
        return formatDate(dateValue);
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ============================================================
// STATUS
// ============================================================

function formatStatus(status) {
    if (!status) {
        return "Pending";
    }

    return String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


function getStatusClass(status) {
    const value =
        String(status || "")
            .toLowerCase();

    if (
        value === "approved" ||
        value === "accepted"
    ) {
        return "approved";
    }

    if (
        value === "rejected" ||
        value === "declined"
    ) {
        return "rejected";
    }

    if (
        value === "cancelled" ||
        value === "canceled"
    ) {
        return "cancelled";
    }

    return "pending";
}


// ============================================================
// MESSAGE / TOAST
// ============================================================

function showLeaveMessage(message, type = "info") {
    if (
        typeof showToast ===
        "function"
    ) {
        showToast(message);
        return;
    }

    let messageBox =
        document.getElementById(
            "leaveMessage"
        );

    if (!messageBox) {
        messageBox =
            document.createElement("div");

        messageBox.id =
            "leaveMessage";

        messageBox.className =
            "leave-message";

        document.body.prepend(
            messageBox
        );
    }

    messageBox.textContent =
        message;

    messageBox.className =
        `leave-message ${type}`;
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.loadLeaveTypes =
    loadLeaveTypes;

window.loadLeaveBalances =
    loadLeaveBalances;

window.loadLeaveRequests =
    loadLeaveRequests;

window.submitLeaveRequest =
    submitLeaveRequest;
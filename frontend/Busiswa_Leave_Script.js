// ============================================================
// ModernTech HR Leave Page
// Database-backed version
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "http://localhost:4000/api";

    // ========================================================
    // DOM ELEMENTS
    // ========================================================

    const leaveSearch = document.getElementById("leaveSearch");
    const leaveDepartment = document.getElementById("leaveDepartment");
    const leaveType = document.getElementById("leaveType");
    const leaveStatus = document.getElementById("leaveStatus");
    const leaveCount = document.getElementById("leaveCount");
    const leaveRows = document.getElementById("leaveRows");
    const refreshLeaveBtn = document.getElementById("refreshLeaveBtn");

    const modalOverlay = document.getElementById("leaveModalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalRequestDetails = document.getElementById("modalRequestDetails");
    const modalTextareaLabel = document.getElementById("modalTextareaLabel");
    const modalReasonTextarea = document.getElementById("modalReasonTextarea");
    const modalCancelBtn = document.getElementById("modalCancelBtn");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalConfirmBtn = document.getElementById("modalConfirmBtn");

    // ========================================================
    // CHECK REQUIRED ELEMENTS
    // ========================================================

    const requiredElements = {
        leaveSearch,
        leaveDepartment,
        leaveType,
        leaveStatus,
        leaveCount,
        leaveRows,
        modalOverlay,
        modalTitle,
        modalSubtitle,
        modalRequestDetails,
        modalTextareaLabel,
        modalReasonTextarea,
        modalCancelBtn,
        modalCloseBtn,
        modalConfirmBtn
    };

    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.warn(`[HR Leave] HTML element not found: #${name}`);
        }
    }

    if (
        !leaveRows ||
        !leaveSearch ||
        !leaveDepartment ||
        !leaveType ||
        !leaveStatus
    ) {
        console.error(
            "[HR Leave] Required leave page elements are missing."
        );
        return;
    }

    // ========================================================
    // STATE
    // ========================================================

    let leaveRequests = [];
    let activeRequest = null;
    let activeAction = null;

    // ========================================================
    // GET HR TOKEN
    // ========================================================

    function getToken() {
        return localStorage.getItem("hrToken");
    }

    // ========================================================
    // HR API REQUEST
    // ========================================================

    async function apiRequest(endpoint, options = {}) {
        const token = getToken();

        if (!token) {
            console.error(
                "[HR Leave] No HR authentication token found."
            );

            localStorage.removeItem("hrToken");
            localStorage.removeItem("hrEmployee");
            localStorage.removeItem("hrRole");

            window.location.href = "index.html";
            return null;
        }

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        headers.Authorization = `Bearer ${token}`;

        let response;

        try {
            response = await fetch(
                `${API_BASE}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );
        } catch (error) {
            console.error(
                "[HR Leave] Backend connection failed:",
                error
            );

            throw new Error(
                "Could not connect to the ModernTech backend. Make sure the backend is running on port 4000."
            );
        }

        let data = {};

        const contentType =
            response.headers.get("content-type");

        if (
            contentType &&
            contentType.includes("application/json")
        ) {
            try {
                data = await response.json();
            } catch (error) {
                console.error(
                    "[HR Leave] Could not parse API response:",
                    error
                );
            }
        }

        console.log(
            `[HR Leave] ${options.method || "GET"} ${endpoint}`,
            response.status,
            data
        );

        // ====================================================
        // UNAUTHORIZED
        // ====================================================

        if (response.status === 401) {
            localStorage.removeItem("hrToken");
            localStorage.removeItem("hrEmployee");
            localStorage.removeItem("hrRole");

            window.location.href = "index.html";
            return null;
        }

        // ====================================================
        // FORBIDDEN
        // ====================================================

        if (response.status === 403) {
            throw new Error(
                data?.error ||
                data?.message ||
                "You do not have permission to access this resource."
            );
        }

        // ====================================================
        // OTHER ERRORS
        // ====================================================

        if (!response.ok) {
            throw new Error(
                data?.error ||
                data?.message ||
                `Request failed with status ${response.status}`
            );
        }

        return data;
    }

    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // ========================================================
    // FORMAT STATUS CLASS
    // ========================================================

    function statusClass(status) {
        const value = String(status || "").toLowerCase();

        if (value === "approved") {
            return "approved";
        }

        if (value === "rejected") {
            return "rejected";
        }

        return "pending";
    }

    // ========================================================
    // FORMAT DURATION
    // ========================================================

    function formatDuration(duration) {
        const days = Number(duration);

        if (!Number.isFinite(days)) {
            return "-";
        }

        return `${days} ${days === 1 ? "Day" : "Days"}`;
    }

    // ========================================================
    // LOAD LEAVE REQUESTS
    // ========================================================

    async function loadLeaveRequests() {
        try {
            leaveRows.innerHTML = `
                <tr>
                    <td colspan="12">
                        Loading leave requests...
                    </td>
                </tr>
            `;

            const response = await apiRequest("/leave");

            if (!response) {
                return;
            }

            leaveRequests = Array.isArray(response)
                ? response
                : Array.isArray(response.data)
                    ? response.data
                    : [];

            console.log(
                "[HR Leave] Requests returned by backend:",
                leaveRequests
            );

            renderLeaveRows();
        } catch (error) {
            console.error(
                "[HR Leave] Failed to load leave requests:",
                error
            );

            leaveRows.innerHTML = `
                <tr>
                    <td colspan="12">
                        Failed to load leave requests:
                        ${escapeHtml(error.message)}
                    </td>
                </tr>
            `;
        }
    }

    // ========================================================
    // FILTER REQUESTS
    // ========================================================

    function getFilteredRequests() {
        const searchValue =
            leaveSearch.value.trim().toLowerCase();

        const departmentValue =
            leaveDepartment.value;

        const typeValue =
            leaveType.value;

        const statusValue =
            leaveStatus.value;

        return leaveRequests.filter(request => {
            const employee =
                String(
                    request.employeeFullName || ""
                ).toLowerCase();

            const employeeCode =
                String(
                    request.employeeCode || ""
                ).toLowerCase();

            const department =
                String(
                    request.department || ""
                );

            const requestLeaveType =
                String(
                    request.leaveType || ""
                );

            const status =
                String(
                    request.leaveStatus || ""
                );

            const matchesSearch =
                !searchValue ||
                employee.includes(searchValue) ||
                employeeCode.includes(searchValue) ||
                department.toLowerCase().includes(searchValue);

            const matchesDepartment =
                departmentValue === "All Departments" ||
                department === departmentValue;

            const matchesType =
                typeValue === "All Types" ||
                requestLeaveType === typeValue;

            const matchesStatus =
                statusValue === "All Statuses" ||
                status === statusValue;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesType &&
                matchesStatus
            );
        });
    }

    // ========================================================
    // RENDER LEAVE TABLE
    // ========================================================

    function renderLeaveRows() {
        const filtered = getFilteredRequests();

        if (leaveCount) {
            leaveCount.textContent = filtered.length;
        }

        if (filtered.length === 0) {
            leaveRows.innerHTML = `
                <tr>
                    <td colspan="12">
                        No leave requests found.
                    </td>
                </tr>
            `;

            return;
        }

        leaveRows.innerHTML = "";

        filtered.forEach(request => {
            const row = document.createElement("tr");

            const employeeName =
                request.employeeFullName ||
                "Unknown employee";

            const initials =
                employeeName
                    .split(" ")
                    .filter(Boolean)
                    .map(part => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

            const status =
                request.leaveStatus ||
                "Pending";

            const requestId =
                request.requestId ??
                request.leaveRequestId ??
                request.leave_request_id;

            row.innerHTML = `
                <td>
                    <div class="emp-cell">
                        <div class="emp-avatar">
                            ${escapeHtml(initials)}
                        </div>

                        <div class="emp-name">
                            ${escapeHtml(employeeName)}
                        </div>
                    </div>
                </td>

                <td>
                    ${escapeHtml(
                        request.employeeCode ||
                        request.employeeId ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        request.department ||
                        "-"
                    )}
                </td>

                <td>
                    <span class="status-pill">
                        ${escapeHtml(
                            request.leaveType ||
                            "-"
                        )}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        request.startDate ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        request.endDate ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        formatDuration(
                            request.duration
                        )
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        request.reason ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        request.submittedDate ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        request.reviewerName ||
                        "-"
                    )}
                </td>

                <td>
                    <span class="status-pill ${statusClass(status)}">
                        ${escapeHtml(status)}
                    </span>
                </td>

                <td>
                    <div class="action-cell-group">
                        ${
                            status === "Pending"
                                ? `
                                    <button
                                        type="button"
                                        class="pay-action-btn approve"
                                        data-action="approve"
                                        data-request-id="${escapeHtml(requestId)}"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        class="pay-action-btn decline"
                                        data-action="reject"
                                        data-request-id="${escapeHtml(requestId)}"
                                    >
                                        Reject
                                    </button>
                                `
                                : `
                                    <span>Completed</span>
                                `
                        }
                    </div>
                </td>
            `;

            const approveButton =
                row.querySelector(
                    '[data-action="approve"]'
                );

            const rejectButton =
                row.querySelector(
                    '[data-action="reject"]'
                );

            if (approveButton) {
                approveButton.addEventListener(
                    "click",
                    () => {
                        openModal(
                            request,
                            "approve"
                        );
                    }
                );
            }

            if (rejectButton) {
                rejectButton.addEventListener(
                    "click",
                    () => {
                        openModal(
                            request,
                            "reject"
                        );
                    }
                );
            }

            leaveRows.appendChild(row);
        });
    }

    // ========================================================
    // OPEN DECISION MODAL
    // ========================================================

    function openModal(request, action) {
        if (
            !modalOverlay ||
            !modalTitle ||
            !modalSubtitle ||
            !modalRequestDetails
        ) {
            console.error(
                "[HR Leave] Decision modal elements are missing."
            );

            return;
        }

        activeRequest = request;
        activeAction = action;

        const isApprove =
            action === "approve";

        modalTitle.textContent =
            isApprove
                ? "Approve Leave Request"
                : "Reject Leave Request";

        modalSubtitle.textContent =
            isApprove
                ? "Confirm that you want to approve this leave request."
                : "Enter a reason before rejecting this leave request.";

        modalRequestDetails.innerHTML = `
            <strong>
                ${escapeHtml(
                    request.employeeFullName ||
                    "Unknown employee"
                )}
            </strong>

            <br>

            Employee ID:
            ${escapeHtml(
                request.employeeCode ||
                request.employeeId ||
                "-"
            )}

            <br>

            Leave:
            ${escapeHtml(
                request.leaveType ||
                "-"
            )}

            <br>

            Dates:
            ${escapeHtml(
                request.startDate ||
                "-"
            )}
            -
            ${escapeHtml(
                request.endDate ||
                "-"
            )}

            <br>

            Duration:
            ${escapeHtml(
                formatDuration(
                    request.duration
                )
            )}
        `;

        if (
            modalReasonTextarea &&
            modalTextareaLabel
        ) {
            modalReasonTextarea.value = "";

            if (isApprove) {
                modalTextareaLabel.style.display = "none";
                modalReasonTextarea.style.display = "none";
            } else {
                modalTextareaLabel.style.display = "block";
                modalReasonTextarea.style.display = "block";
            }
        }

        if (modalConfirmBtn) {
            modalConfirmBtn.textContent =
                isApprove
                    ? "Approve"
                    : "Reject";
        }

        modalOverlay.classList.remove("hidden");
    }

    // ========================================================
    // CLOSE MODAL
    // ========================================================

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.add("hidden");
        }

        activeRequest = null;
        activeAction = null;
    }

    // ========================================================
    // PROCESS DECISION
    // ========================================================

    async function processDecision() {
        if (
            !activeRequest ||
            !activeAction
        ) {
            return;
        }

        const requestId = Number(
            activeRequest.requestId ??
            activeRequest.leaveRequestId ??
            activeRequest.leave_request_id
        );

        if (
            !Number.isInteger(requestId) ||
            requestId <= 0
        ) {
            console.error(
                "[HR Leave] Invalid leave request ID:",
                activeRequest
            );

            alert(
                "This leave request does not have a valid database ID."
            );

            return;
        }

        const status =
            activeAction === "approve"
                ? "Approved"
                : "Rejected";

        let reason = "";

        if (status === "Rejected") {
            reason =
                modalReasonTextarea
                    ? modalReasonTextarea.value.trim()
                    : "";

            if (!reason) {
                alert(
                    "Please enter a reason for rejection."
                );

                return;
            }
        }

        console.log(
            "[HR Leave] Sending leave decision:",
            {
                requestId,
                status,
                reason
            }
        );

        if (modalConfirmBtn) {
            modalConfirmBtn.disabled = true;
            modalConfirmBtn.textContent = "Saving...";
        }

        try {
            const response = await apiRequest(
                `/leave/${requestId}/decision`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        status,
                        reason
                    })
                }
            );

            console.log(
                "[HR Leave] Decision response:",
                response
            );

            closeModal();

            // Reload from the database so the UI reflects
            // the actual saved status.
            await loadLeaveRequests();

            if (
                response?.data?.notificationCreated === false
            ) {
                alert(
                    status === "Approved"
                        ? "Leave was approved, but the worker notification could not be created."
                        : "Leave was rejected, but the worker notification could not be created."
                );
            } else {
                alert(
                    status === "Approved"
                        ? "Leave request approved successfully."
                        : "Leave request rejected successfully."
                );
            }

        } catch (error) {
            console.error(
                "[HR Leave] Decision request failed:",
                error
            );

            alert(
                error.message ||
                "Could not update the leave request."
            );

        } finally {
            if (modalConfirmBtn) {
                modalConfirmBtn.disabled = false;

                modalConfirmBtn.textContent =
                    status === "Approved"
                        ? "Approve"
                        : "Reject";
            }
        }
    }

    // ========================================================
    // FILTER EVENTS
    // ========================================================

    leaveSearch.addEventListener(
        "input",
        renderLeaveRows
    );

    leaveDepartment.addEventListener(
        "change",
        renderLeaveRows
    );

    leaveType.addEventListener(
        "change",
        renderLeaveRows
    );

    leaveStatus.addEventListener(
        "change",
        renderLeaveRows
    );

    // ========================================================
    // REFRESH BUTTON
    // ========================================================

    if (refreshLeaveBtn) {
        refreshLeaveBtn.addEventListener(
            "click",
            loadLeaveRequests
        );
    }

    // ========================================================
    // MODAL BUTTONS
    // ========================================================

    if (modalCancelBtn) {
        modalCancelBtn.addEventListener(
            "click",
            closeModal
        );
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener(
            "click",
            closeModal
        );
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener(
            "click",
            processDecision
        );
    }

    // Close modal when clicking outside it
    if (modalOverlay) {
        modalOverlay.addEventListener(
            "click",
            event => {
                if (event.target === modalOverlay) {
                    closeModal();
                }
            }
        );
    }

    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                modalOverlay &&
                !modalOverlay.classList.contains("hidden")
            ) {
                closeModal();
            }
        }
    );

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    await loadLeaveRequests();
});
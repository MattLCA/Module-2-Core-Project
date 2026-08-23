// ============================================================
// ModernTech HR Leave Page
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const API_BASE =
            "http://localhost:4000/api";


        // --------------------------------------------------------
        // DOM ELEMENTS
        // --------------------------------------------------------

        const leaveSearch =
            document.getElementById(
                "leaveSearch"
            );

        const leaveDepartment =
            document.getElementById(
                "leaveDepartment"
            );

        const leaveType =
            document.getElementById(
                "leaveType"
            );

        const leaveStatus =
            document.getElementById(
                "leaveStatus"
            );

        const leaveCount =
            document.getElementById(
                "leaveCount"
            );

        const leaveRows =
            document.getElementById(
                "leaveRows"
            );

        const refreshLeaveBtn =
            document.getElementById(
                "refreshLeaveBtn"
            );


        const modalOverlay =
            document.getElementById(
                "leaveModalOverlay"
            );

        const modalTitle =
            document.getElementById(
                "modalTitle"
            );

        const modalSubtitle =
            document.getElementById(
                "modalSubtitle"
            );

        const modalRequestDetails =
            document.getElementById(
                "modalRequestDetails"
            );

        const modalTextareaLabel =
            document.getElementById(
                "modalTextareaLabel"
            );

        const modalReasonTextarea =
            document.getElementById(
                "modalReasonTextarea"
            );

        const modalCancelBtn =
            document.getElementById(
                "modalCancelBtn"
            );

        const modalCloseBtn =
            document.getElementById(
                "modalCloseBtn"
            );

        const modalConfirmBtn =
            document.getElementById(
                "modalConfirmBtn"
            );


        // --------------------------------------------------------
        // DATA
        // --------------------------------------------------------

        let leaveRequests = [];

        let activeRequest = null;

        let activeAction = null;


        // --------------------------------------------------------
        // AUTH TOKEN
        // --------------------------------------------------------

        function getToken() {

            return (
                localStorage.getItem(
                    "authToken"
                ) ||

                localStorage.getItem(
                    "token"
                )
            );

        }


        // --------------------------------------------------------
        // AUTHENTICATED REQUEST
        // --------------------------------------------------------

        async function apiRequest(
            endpoint,
            options = {}
        ) {

            const token =
                getToken();


            if (!token) {

                window.location.href =
                    "index.html";

                return null;

            }


            const response =
                await fetch(
                    `${API_BASE}${endpoint}`,
                    {

                        ...options,

                        headers: {

                            "Content-Type":
                                "application/json",

                            ...(options.headers ||
                                {}),

                            Authorization:
                                `Bearer ${token}`

                        }

                    }
                );


            const contentType =
                response.headers
                    .get(
                        "content-type"
                    );


            let result =
                null;


            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                result =
                    await response.json();

            }


            if (
                response.status ===
                401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "authToken"
                );

                window.location.href =
                    "index.html";

                return null;

            }


            if (!response.ok) {

                throw new Error(
                    result?.error ||
                    result?.message ||
                    "Request failed."
                );

            }


            return result;

        }


        // --------------------------------------------------------
        // LOAD LEAVE REQUESTS
        // --------------------------------------------------------

        async function loadLeaveRequests() {

            try {

                leaveRows.innerHTML = `

                    <tr>

                        <td colspan="12">

                            Loading leave requests...

                        </td>

                    </tr>

                `;


                const response =
                    await apiRequest(
                        "/leave"
                    );


                if (!response) {

                    return;

                }


                console.log(
                    "[HR Leave] API response:",
                    response
                );


                // Support both:

                // {
                //   data: [...]
                // }

                // and an older direct array response.

                leaveRequests =
                    Array.isArray(
                        response
                    )

                        ? response

                        : Array.isArray(
                            response.data
                        )

                            ? response.data

                            : [];


                console.log(
                    "[HR Leave] Loaded requests:",
                    leaveRequests
                );


                renderLeaveRows();

            } catch (error) {

                console.error(
                    "[HR Leave] Could not load requests:",
                    error
                );


                leaveRows.innerHTML = `

                    <tr>

                        <td colspan="12">

                            Failed to load leave requests:
                            ${escapeHtml(
                                error.message
                            )}

                        </td>

                    </tr>

                `;

            }

        }


        // --------------------------------------------------------
        // ESCAPE HTML
        // --------------------------------------------------------

        function escapeHtml(
            value
        ) {

            return String(
                value ?? ""
            )

                .replaceAll(
                    "&",
                    "&amp;"
                )

                .replaceAll(
                    "<",
                    "&lt;"
                )

                .replaceAll(
                    ">",
                    "&gt;"
                )

                .replaceAll(
                    '"',
                    "&quot;"
                )

                .replaceAll(
                    "'",
                    "&#039;"
                );

        }


        // --------------------------------------------------------
        // FORMAT STATUS
        // --------------------------------------------------------

        function statusClass(
            status
        ) {

            const normal =
                String(
                    status
                )
                    .toLowerCase();


            if (
                normal ===
                "approved"
            ) {

                return "approved";

            }


            if (
                normal ===
                "rejected"
            ) {

                return "rejected";

            }


            return "pending";

        }


        // --------------------------------------------------------
        // FORMAT LEAVE TYPE
        // --------------------------------------------------------

        function formatLeaveType(
            type
        ) {

            return String(
                type || ""
            )
                .replace(
                    /\s+/g,
                    "-"
                )
                .toLowerCase();

        }


        // --------------------------------------------------------
        // FORMAT DURATION
        // --------------------------------------------------------

        function formatDuration(
            duration
        ) {

            const days =
                Number(
                    duration
                );


            if (
                !Number.isFinite(
                    days
                )
            ) {

                return "-";

            }


            return `${days} ${
                days === 1
                    ? "Day"
                    : "Days"
            }`;

        }


        // --------------------------------------------------------
        // FILTER
        // --------------------------------------------------------

        function getFilteredRequests() {

            const searchValue =
                leaveSearch.value
                    .trim()
                    .toLowerCase();


            const departmentValue =
                leaveDepartment.value;


            const typeValue =
                leaveType.value;


            const statusValue =
                leaveStatus.value;


            return leaveRequests.filter(
                request => {

                    const employee =
                        String(
                            request.employeeFullName ||
                            ""
                        )
                            .toLowerCase();


                    const employeeCode =
                        String(
                            request.employeeCode ||
                            ""
                        )
                            .toLowerCase();


                    const department =
                        String(
                            request.department ||
                            ""
                        )
                            .toLowerCase();


                    const requestLeaveType =
                        String(
                            request.leaveType ||
                            ""
                        );


                    const requestStatus =
                        String(
                            request.leaveStatus ||
                            ""
                        );


                    const matchesSearch =
                        !searchValue ||

                        employee.includes(
                            searchValue
                        ) ||

                        employeeCode.includes(
                            searchValue
                        ) ||

                        department.includes(
                            searchValue
                        );


                    const matchesDepartment =
                        departmentValue ===
                        "All Departments" ||

                        request.department ===
                        departmentValue;


                    const matchesType =
                        typeValue ===
                        "All Types" ||

                        requestLeaveType ===
                        typeValue;


                    const matchesStatus =
                        statusValue ===
                        "All Statuses" ||

                        requestStatus ===
                        statusValue;


                    return (
                        matchesSearch &&
                        matchesDepartment &&
                        matchesType &&
                        matchesStatus
                    );

                }
            );

        }


        // --------------------------------------------------------
        // RENDER TABLE
        // --------------------------------------------------------

        function renderLeaveRows() {

            const filtered =
                getFilteredRequests();


            leaveCount.textContent =
                filtered.length;


            if (
                filtered.length ===
                0
            ) {

                leaveRows.innerHTML = `

                    <tr>

                        <td colspan="12">

                            No leave requests found.

                        </td>

                    </tr>

                `;

                return;

            }


            leaveRows.innerHTML =
                "";


            filtered.forEach(
                request => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const name =
                        request.employeeFullName ||
                        "Unknown employee";


                    const initials =
                        name
                            .split(" ")
                            .filter(Boolean)
                            .map(
                                part =>
                                    part[0]
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();


                    const status =
                        request.leaveStatus ||
                        "Pending";


                    const canAction =
                        status ===
                        "Pending";


                    row.innerHTML = `

                        <td>

                            <div class="emp-cell">

                                <div class="emp-avatar">

                                    ${escapeHtml(
                                        initials
                                    )}

                                </div>

                                <div>

                                    <div class="emp-name">

                                        ${escapeHtml(
                                            name
                                        )}

                                    </div>

                                </div>

                            </div>

                        </td>


                        <td>

                            ${escapeHtml(
                                request.employeeCode ||
                                request.employeeId
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                request.department
                            )}

                        </td>


                        <td>

                            <span
                                class="status-pill ${formatLeaveType(
                                    request.leaveType
                                )}"
                            >

                                ${escapeHtml(
                                    request.leaveType
                                )}

                            </span>

                        </td>


                        <td>

                            ${escapeHtml(
                                request.startDate
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                request.endDate
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

                            <span
                                class="status-pill ${statusClass(
                                    status
                                )}"
                            >

                                ${escapeHtml(
                                    status
                                )}

                            </span>

                        </td>


                        <td>

                            <div
                                class="action-cell-group"
                            >

                                ${
                                    canAction
                                        ? `
                                            <button
                                                class="pay-action-btn approve"
                                                type="button"
                                                data-action="approve"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                class="pay-action-btn decline"
                                                type="button"
                                                data-action="reject"
                                            >
                                                Reject
                                            </button>
                                        `
                                        : `
                                            <span>
                                                Completed
                                            </span>
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


                    if (
                        approveButton
                    ) {

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


                    if (
                        rejectButton
                    ) {

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


                    leaveRows.appendChild(
                        row
                    );

                }
            );

        }


        // --------------------------------------------------------
        // OPEN MODAL
        // --------------------------------------------------------

        function openModal(
            request,
            action
        ) {

            activeRequest =
                request;

            activeAction =
                action;


            const isApprove =
                action ===
                "approve";


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
                        request.employeeFullName
                    )}
                </strong>

                (${escapeHtml(
                    request.employeeCode
                )})

                <br>

                ${escapeHtml(
                    request.department
                )}

                •
                ${escapeHtml(
                    request.leaveType
                )}

                •
                ${escapeHtml(
                    formatDuration(
                        request.duration
                    )
                )}

                <br>

                ${escapeHtml(
                    request.startDate
                )}

                -

                ${escapeHtml(
                    request.endDate
                )}

                <br>

                Submitted:
                ${escapeHtml(
                    request.submittedDate
                )}

            `;


            modalReasonTextarea.value =
                "";


            if (isApprove) {

                modalTextareaLabel.style.display =
                    "none";

                modalReasonTextarea.style.display =
                    "none";

                modalConfirmBtn.textContent =
                    "Approve";

            } else {

                modalTextareaLabel.style.display =
                    "block";

                modalReasonTextarea.style.display =
                    "block";

                modalConfirmBtn.textContent =
                    "Reject";

            }


            modalConfirmBtn.disabled =
                false;


            modalOverlay.classList.remove(
                "hidden"
            );

        }


        // --------------------------------------------------------
        // CLOSE MODAL
        // --------------------------------------------------------

        function closeModal() {

            modalOverlay.classList.add(
                "hidden"
            );


            activeRequest =
                null;

            activeAction =
                null;


            modalReasonTextarea.value =
                "";

        }


        // --------------------------------------------------------
        // PROCESS DECISION
        // --------------------------------------------------------

        async function processDecision() {

            if (
                !activeRequest ||
                !activeAction
            ) {

                return;

            }


            const status =
                activeAction ===
                "approve"

                    ? "Approved"

                    : "Rejected";


            let reason =
                "";


            if (
                status ===
                "Rejected"
            ) {

                reason =
                    modalReasonTextarea.value
                        .trim();


                if (!reason) {

                    alert(
                        "Please enter a reason for rejecting this request."
                    );

                    modalReasonTextarea.focus();

                    return;

                }

            }


            modalConfirmBtn.disabled =
                true;


            const originalText =
                modalConfirmBtn.textContent;


            modalConfirmBtn.textContent =
                "Saving...";


            try {

                await apiRequest(

                    `/leave/${activeRequest.requestId}/decision`,

                    {

                        method:
                            "PUT",

                        body:
                            JSON.stringify({

                                status,

                                reason

                            })

                    }

                );


                closeModal();


                await loadLeaveRequests();


            } catch (error) {

                console.error(
                    "Leave decision error:",
                    error
                );


                alert(
                    error.message
                );


            } finally {

                modalConfirmBtn.disabled =
                    false;

                modalConfirmBtn.textContent =
                    originalText;

            }

        }


        // --------------------------------------------------------
        // EVENT LISTENERS
        // --------------------------------------------------------

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


        refreshLeaveBtn.addEventListener(
            "click",
            loadLeaveRequests
        );


        modalCancelBtn.addEventListener(
            "click",
            closeModal
        );


        modalCloseBtn.addEventListener(
            "click",
            closeModal
        );


        modalConfirmBtn.addEventListener(
            "click",
            processDecision
        );


        modalOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modalOverlay
                ) {

                    closeModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape" &&

                    !modalOverlay
                        .classList
                        .contains(
                            "hidden"
                        )
                ) {

                    closeModal();

                }

            }
        );


        // --------------------------------------------------------
        // INITIAL LOAD
        // --------------------------------------------------------

        await loadLeaveRequests();

    }
);


// ============================================================
// LOGOUT
// ============================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "employee"
            );

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "userRole"
            );

            localStorage.removeItem(
                "workerProfile"
            );

            window.location.href =
                "index.html";

        }
    );

}
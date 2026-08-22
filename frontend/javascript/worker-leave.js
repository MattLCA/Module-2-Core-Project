// ============================================================
// ModernTech Worker Leave
// ============================================================

console.log("Worker Leave JS connected.");

let workerLeaveBalances = [];
let workerLeaveRequests = [];


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (
            typeof requireWorkerLogin === "function" &&
            !requireWorkerLogin()
        ) {
            return;
        }


        initializeLeaveTabs();

        initializeLeaveForm();

        initializeLeaveFilters();

        initializeLeaveModal();

        initializeLeaveDayValidation();


        await loadLeaveData();

    }
);


// ============================================================
// LOAD LEAVE DATA
// ============================================================

async function loadLeaveData() {

    try {

        const [
            balancesResponse,
            requestsResponse
        ] = await Promise.all([

            getWorkerLeaveBalances(),

            getWorkerLeaveRequests()

        ]);


        console.log(
            "Leave balances response:",
            balancesResponse
        );


        console.log(
            "Leave requests response:",
            requestsResponse
        );


        workerLeaveBalances =
            extractResponseArray(
                balancesResponse
            );


        workerLeaveRequests =
            extractResponseArray(
                requestsResponse
            );


        console.log(
            "Processed leave balances:",
            workerLeaveBalances
        );


        console.log(
            "Processed leave requests:",
            workerLeaveRequests
        );


        renderLeaveBalances();

        renderLeaveRequests(
            workerLeaveRequests
        );


        updateLeaveDayLimit();


    } catch (error) {

        console.error(
            "Leave loading error:",
            error
        );


        showToast(
            error.message ||
            "Could not load leave information."
        );

    }

}


// ============================================================
// EXTRACT ARRAY FROM API RESPONSE
// ============================================================

function extractResponseArray(
    response
) {

    if (
        Array.isArray(response)
    ) {

        return response;

    }


    if (
        Array.isArray(response?.data)
    ) {

        return response.data;

    }


    if (
        Array.isArray(response?.rows)
    ) {

        return response.rows;

    }


    if (
        Array.isArray(response?.data?.rows)
    ) {

        return response.data.rows;

    }


    return [];

}


// ============================================================
// LEAVE BALANCES
// ============================================================

function renderLeaveBalances() {

    const balanceMap = {

        "annual leave":
            "annualLeave",

        "sick leave":
            "sickLeave",

        "family responsibility":
            "familyLeave",

        "study leave":
            "studyLeave",

        "personal":
            "personalLeave",

        "vacation":
            "vacationLeave",

        "medical appointment":
            "medicalLeave",

        "bereavement":
            "bereavementLeave",

        "childcare":
            "childcareLeave"

    };


    // Reset everything first.

    Object.values(
        balanceMap
    ).forEach(
        (elementId) => {

            const element =
                document.getElementById(
                    elementId
                );


            if (element) {

                element.textContent =
                    "0 days";

            }

        }
    );


    // Apply database values.

    workerLeaveBalances.forEach(
        (balance) => {

            const typeName =
                String(
                    balance.leaveTypeName ??
                    balance.leave_type_name ??
                    ""
                )
                    .trim()
                    .toLowerCase();


            const elementId =
                balanceMap[
                    typeName
                ];


            if (!elementId) {

                console.warn(
                    "Could not map leave balance:",
                    balance
                );

                return;

            }


            const element =
                document.getElementById(
                    elementId
                );


            if (!element) {

                return;

            }


            const remaining =
                Number(
                    balance.remainingDays ??
                    balance.remaining_days ??
                    0
                );


            element.textContent =
                `${formatDays(remaining)} days`;

        }
    );


    // Pending requests.

    const pendingCount =
        workerLeaveRequests.filter(
            (request) => {

                return String(
                    request.status ??
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                    "pending";

            }
        ).length;


    const pendingElement =
        document.getElementById(
            "leavePendingText"
        );


    if (pendingElement) {

        pendingElement.textContent =
            pendingCount;

    }

}


// ============================================================
// GET BALANCE FOR SELECTED LEAVE TYPE
// ============================================================

function getSelectedLeaveBalance() {

    const leaveType =
        document.getElementById(
            "leaveType"
        );


    if (
        !leaveType ||
        !leaveType.value
    ) {

        return null;

    }


    const leaveTypeId =
        Number(
            leaveType.value
        );


    const balance =
        workerLeaveBalances.find(
            (item) => {

                const id =
                    Number(
                        item.leaveTypeId ??
                        item.leave_type_id
                    );


                return id ===
                    leaveTypeId;

            }
        );


    if (!balance) {

        return null;

    }


    return Number(
        balance.remainingDays ??
        balance.remaining_days ??
        0
    );

}


// ============================================================
// GET SELECTED LEAVE TYPE NAME
// ============================================================

function getSelectedLeaveTypeName() {

    const select =
        document.getElementById(
            "leaveType"
        );


    if (!select) {

        return "";

    }


    return (
        select.options[
            select.selectedIndex
        ]?.textContent ||
        ""
    ).trim();

}


// ============================================================
// CALCULATE DAYS FROM DATES
// ============================================================

function calculateDaysFromDates(
    startDate,
    endDate
) {

    if (
        !startDate ||
        !endDate
    ) {

        return null;

    }


    const start =
        new Date(
            `${startDate}T00:00:00`
        );


    const end =
        new Date(
            `${endDate}T00:00:00`
        );


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {

        return null;

    }


    if (
        end < start
    ) {

        return null;

    }


    return Math.floor(
        (
            end.getTime() -
            start.getTime()
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )
    ) + 1;

}


// ============================================================
// UPDATE MAXIMUM DAYS
// ============================================================

function updateLeaveDayLimit() {

    const daysInput =
        document.getElementById(
            "leaveDays"
        );


    if (!daysInput) {

        return;

    }


    const balance =
        getSelectedLeaveBalance();


    if (
        balance === null
    ) {

        daysInput.removeAttribute(
            "max"
        );

        return;

    }


    daysInput.max =
        Math.floor(
            Math.max(
                0,
                balance
            )
        );


    const requested =
        Number(
            daysInput.value
        );


    if (
        requested &&
        requested >
        balance
    ) {

        daysInput.setCustomValidity(
            `You only have ${formatDays(balance)} day(s) of ${getSelectedLeaveTypeName()} remaining.`
        );

    } else {

        daysInput.setCustomValidity(
            ""
        );

    }

}


// ============================================================
// LIVE DAYS VALIDATION
// ============================================================

function initializeLeaveDayValidation() {

    const typeSelect =
        document.getElementById(
            "leaveType"
        );


    const daysInput =
        document.getElementById(
            "leaveDays"
        );


    const startDate =
        document.getElementById(
            "startDate"
        );


    const endDate =
        document.getElementById(
            "endDate"
        );


    if (typeSelect) {

        typeSelect.addEventListener(
            "change",
            () => {

                updateLeaveDayLimit();

            }
        );

    }


    if (daysInput) {

        daysInput.addEventListener(
            "input",
            () => {

                validateRequestedDays(
                    false
                );

            }
        );

    }


    if (startDate) {

        startDate.addEventListener(
            "change",
            () => {

                syncDaysWithDates();

            }
        );

    }


    if (endDate) {

        endDate.addEventListener(
            "change",
            () => {

                syncDaysWithDates();

            }
        );

    }

}


// ============================================================
// SYNC DAYS WITH DATE RANGE
// ============================================================

function syncDaysWithDates() {

    const daysInput =
        document.getElementById(
            "leaveDays"
        );


    const start =
        document.getElementById(
            "startDate"
        )?.value;


    const end =
        document.getElementById(
            "endDate"
        )?.value;


    if (
        !daysInput ||
        !start ||
        !end
    ) {

        return;

    }


    const calculated =
        calculateDaysFromDates(
            start,
            end
        );


    if (
        calculated === null
    ) {

        return;

    }


    // Automatically keep Total Days consistent
    // with the selected date range.

    daysInput.value =
        calculated;


    validateRequestedDays(
        false
    );

}


// ============================================================
// VALIDATE REQUESTED DAYS
// ============================================================

function validateRequestedDays(
    showMessage = true
) {

    const daysInput =
        document.getElementById(
            "leaveDays"
        );


    if (!daysInput) {

        return false;

    }


    const requested =
        Number(
            daysInput.value
        );


    const balance =
        getSelectedLeaveBalance();


    // No category selected yet.

    if (
        balance === null
    ) {

        daysInput.setCustomValidity(
            ""
        );

        return true;

    }


    // Must be whole number >= 1.

    if (
        !Number.isInteger(
            requested
        ) ||
        requested < 1
    ) {

        daysInput.setCustomValidity(
            "Please enter at least 1 leave day."
        );


        if (showMessage) {

            showToast(
                "Please enter a valid number of leave days."
            );

        }


        return false;

    }


    // Must not exceed balance.

    if (
        requested >
        balance
    ) {

        const message =
            `You only have ${formatDays(balance)} day(s) of ${getSelectedLeaveTypeName()} remaining.`;


        daysInput.setCustomValidity(
            message
        );


        if (showMessage) {

            showToast(
                message
            );

        }


        return false;

    }


    daysInput.setCustomValidity(
        ""
    );


    return true;

}


// ============================================================
// SUBMIT FORM
// ============================================================

function initializeLeaveForm() {

    const form =
        document.getElementById(
            "leaveForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const leaveTypeId =
                Number(
                    document.getElementById(
                        "leaveType"
                    )?.value
                );


            const startDate =
                document.getElementById(
                    "startDate"
                )?.value;


            const endDate =
                document.getElementById(
                    "endDate"
                )?.value;


            const leaveDays =
                Number(
                    document.getElementById(
                        "leaveDays"
                    )?.value
                );


            const reason =
                document.getElementById(
                    "leaveReason"
                )?.value.trim();


            // ----------------------------------------------------
            // Required fields.
            // ----------------------------------------------------

            if (!leaveTypeId) {

                showToast(
                    "Please select a leave type."
                );

                return;

            }


            if (!startDate) {

                showToast(
                    "Please select a start date."
                );

                return;

            }


            if (!endDate) {

                showToast(
                    "Please select an end date."
                );

                return;

            }


            if (!reason) {

                showToast(
                    "Please provide a reason for your leave."
                );

                return;

            }


            // ----------------------------------------------------
            // Date calculation.
            // ----------------------------------------------------

            const calculatedDays =
                calculateDaysFromDates(
                    startDate,
                    endDate
                );


            if (
                calculatedDays === null
            ) {

                showToast(
                    "Please enter a valid leave date range."
                );

                return;

            }


            // ----------------------------------------------------
            // Make sure Total Days agrees with dates.
            // ----------------------------------------------------

            if (
                leaveDays !==
                calculatedDays
            ) {

                showToast(
                    `The selected dates equal ${calculatedDays} day(s). Please enter ${calculatedDays} in Total Days.`
                );

                return;

            }


            // ----------------------------------------------------
            // Check selected category balance.
            // ----------------------------------------------------

            const balance =
                getSelectedLeaveBalance();


            if (
                balance === null
            ) {

                showToast(
                    "The balance for this leave category could not be loaded. Please refresh the page and try again."
                );

                return;

            }


            if (
                leaveDays >
                balance
            ) {

                showToast(
                    `You only have ${formatDays(balance)} day(s) of ${getSelectedLeaveTypeName()} remaining.`
                );

                return;

            }


            // ----------------------------------------------------
            // Disable submit button.
            // ----------------------------------------------------

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting...";

            }


            try {

                // ------------------------------------------------
                // Submit to database through API.
                // ------------------------------------------------

                const response =
                    await createWorkerLeaveRequest({

                        leaveTypeId,

                        startDate,

                        endDate,

                        totalDays:
                            leaveDays,

                        reason

                    });


                console.log(
                    "Leave submission response:",
                    response
                );


                const request =
                    response?.data ||
                    response;


                if (!request) {

                    throw new Error(
                        "The server did not return the submitted request."
                    );

                }


                // ------------------------------------------------
                // Show confirmation.
                // ------------------------------------------------

                showLeaveModal(
                    request
                );


                // ------------------------------------------------
                // Clear form.
                // ------------------------------------------------

                form.reset();


                // ------------------------------------------------
                // Refresh DB data.
                // ------------------------------------------------

                await loadLeaveData();

            } catch (error) {

                console.error(
                    "Leave submission error:",
                    error
                );


                showToast(
                    error.message ||
                    "Could not submit leave request."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Request";

                }

            }

        }
    );

}


// ============================================================
// SHOW MODAL
// ============================================================

function showLeaveModal(
    request
) {

    const selectedType =
        getSelectedLeaveTypeName();


    setText(
        "summaryType",
        request.leaveTypeName ||
        selectedType ||
        "Leave"
    );


    setText(
        "summaryDays",
        `${request.totalDays ?? "--"} days`
    );


    setText(
        "summaryStart",
        formatDate(
            request.startDate
        )
    );


    setText(
        "summaryEnd",
        formatDate(
            request.endDate
        )
    );


    setText(
        "summaryReason",
        request.reason ||
        "--"
    );


    const modal =
        document.getElementById(
            "leaveModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

        modal.classList.add(
            "active"
        );

    }

}


// ============================================================
// MODAL
// ============================================================

function initializeLeaveModal() {

    const closeButton =
        document.getElementById(
            "closeModal"
        );


    if (!closeButton) {

        return;

    }


    closeButton.addEventListener(
        "click",
        closeLeaveModal
    );

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeLeaveModal() {

    const modal =
        document.getElementById(
            "leaveModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

        modal.classList.remove(
            "active"
        );

    }


    activateLeaveTab(
        "history"
    );


    renderLeaveRequests(
        workerLeaveRequests
    );

}


// ============================================================
// TABS
// ============================================================

function initializeLeaveTabs() {

    document
        .querySelectorAll(
            ".leave-tab"
        )
        .forEach(
            (tab) => {

                tab.addEventListener(
                    "click",
                    () => {

                        activateLeaveTab(
                            tab.dataset.tab
                        );

                    }
                );

            }
        );

}


// ============================================================
// ACTIVATE TAB
// ============================================================

function activateLeaveTab(
    target
) {

    document
        .querySelectorAll(
            ".leave-tab"
        )
        .forEach(
            (tab) => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.tab ===
                    target
                );

            }
        );


    document
        .querySelectorAll(
            ".leave-content"
        )
        .forEach(
            (content) => {

                content.classList.toggle(
                    "active",
                    content.id ===
                    target
                );

            }
        );


    if (
        target ===
        "history"
    ) {

        renderLeaveRequests(
            workerLeaveRequests
        );

    }


    if (
        target ===
        "balance"
    ) {

        renderLeaveBalances();

    }

}


// ============================================================
// HISTORY
// ============================================================

function renderLeaveRequests(
    requests
) {

    const table =
        document.getElementById(
            "leaveTable"
        );


    if (!table) {

        return;

    }


    if (
        !Array.isArray(requests) ||
        requests.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    No leave requests found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        requests
            .map(
                (request) => {

                    const type =
                        request.leaveTypeName ??
                        request.leave_type_name ??
                        "Leave";


                    const start =
                        request.startDate ??
                        request.start_date;


                    const end =
                        request.endDate ??
                        request.end_date;


                    const days =
                        request.totalDays ??
                        request.total_days ??
                        0;


                    const status =
                        request.status ??
                        "Pending";


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(type)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(start)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(end)
                                )}
                            </td>

                            <td>
                                ${escapeHTML(days)}
                            </td>

                            <td>
                                <span class="status">
                                    ${escapeHTML(status)}
                                </span>
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// ============================================================
// FILTERS
// ============================================================

function initializeLeaveFilters() {

    const filterType =
        document.getElementById(
            "filterType"
        );


    const filterStatus =
        document.getElementById(
            "filterStatus"
        );


    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    if (filterType) {

        filterType.addEventListener(
            "change",
            applyLeaveFilters
        );

    }


    if (filterStatus) {

        filterStatus.addEventListener(
            "change",
            applyLeaveFilters
        );

    }


    if (fromDate) {

        fromDate.addEventListener(
            "change",
            applyLeaveFilters
        );

    }


    if (toDate) {

        toDate.addEventListener(
            "change",
            applyLeaveFilters
        );

    }


    const clearFilters =
        document.getElementById(
            "clearFilters"
        );


    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            () => {

                if (filterType) {

                    filterType.value =
                        "All";

                }


                if (filterStatus) {

                    filterStatus.value =
                        "All";

                }


                if (fromDate) {

                    fromDate.value =
                        "";

                }


                if (toDate) {

                    toDate.value =
                        "";

                }


                renderLeaveRequests(
                    workerLeaveRequests
                );

            }
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyLeaveFilters() {

    const type =
        document.getElementById(
            "filterType"
        )?.value ||
        "All";


    const status =
        document.getElementById(
            "filterStatus"
        )?.value ||
        "All";


    const from =
        document.getElementById(
            "fromDate"
        )?.value ||
        "";


    const to =
        document.getElementById(
            "toDate"
        )?.value ||
        "";


    const filtered =
        workerLeaveRequests.filter(
            (request) => {

                const requestType =
                    request.leaveTypeName ??
                    request.leave_type_name ??
                    "";


                const requestStatus =
                    request.status ??
                    "";


                const requestStart =
                    request.startDate ??
                    request.start_date ??
                    "";


                if (
                    type !== "All" &&
                    requestType !== type
                ) {

                    return false;

                }


                if (
                    status !== "All" &&
                    requestStatus !== status
                ) {

                    return false;

                }


                if (
                    from &&
                    requestStart < from
                ) {

                    return false;

                }


                if (
                    to &&
                    requestStart > to
                ) {

                    return false;

                }


                return true;

            }
        );


    renderLeaveRequests(
        filtered
    );

}


// ============================================================
// HELPERS
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ??
            "--";

    }

}


function formatDate(
    value
) {

    if (!value) {

        return "--";

    }


    const text =
        String(value)
            .substring(
                0,
                10
            );


    const date =
        new Date(
            `${text}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleDateString(
        "en-ZA",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


function formatDays(
    value
) {

    const number =
        Number(value);


    if (
        Number.isInteger(number)
    ) {

        return String(number);

    }


    return number.toFixed(2);

}


function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// GLOBALS
// ============================================================

window.loadLeaveData =
    loadLeaveData;

window.renderLeaveBalances =
    renderLeaveBalances;

window.renderLeaveRequests =
    renderLeaveRequests;
// ============================================================
// ModernTech Worker Leave
// ============================================================

console.log("Worker Leave JS connected.");

let workerLeaveTypes = [];
let workerLeaveBalances = [];
let workerLeaveRequests = [];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Initializing Worker Leave..."
        );


        // --------------------------------------------------------
        // Authentication
        // --------------------------------------------------------

        if (
            typeof requireWorkerLogin !==
            "function"
        ) {

            console.error(
                "requireWorkerLogin() is not available."
            );

            return;

        }


        if (
            !requireWorkerLogin()
        ) {

            return;

        }


        // --------------------------------------------------------
        // Initialize UI
        // --------------------------------------------------------

        initializeLeaveTabs();

        initializeLeaveForm();

        initializeLeaveFilters();

        initializeLeaveModal();

        initializeLeaveDayValidation();


        // --------------------------------------------------------
        // Load each database section independently.
        // --------------------------------------------------------

        await Promise.allSettled([

            loadLeaveTypes(),

            loadLeaveBalances(),

            loadLeaveRequests()

        ]);


        updateLeaveDayLimit();


        console.log(
            "Worker Leave initialization complete."
        );

    }
);


// ============================================================
// LOAD LEAVE TYPES
// ============================================================

async function loadLeaveTypes() {

    console.log(
        "[Leave] Loading leave types..."
    );


    try {

        const response =
            await getWorkerLeaveTypes();


        console.log(
            "[Leave] LEAVE TYPES API RESPONSE:",
            response
        );


        workerLeaveTypes =
            extractResponseArray(
                response
            );


        console.log(
            "[Leave] Processed leave types:",
            workerLeaveTypes
        );


        renderLeaveTypes();


    } catch (error) {

        console.error(
            "[Leave] Failed to load leave types:",
            error
        );


        renderFallbackLeaveTypes();

    }

}


// ============================================================
// LOAD LEAVE BALANCES
// ============================================================

async function loadLeaveBalances() {

    console.log(
        "[Leave] Loading leave balances..."
    );


    try {

        const response =
            await getWorkerLeaveBalances();


        // --------------------------------------------------------
        // IMPORTANT DEBUG OUTPUT
        // --------------------------------------------------------

        console.log(
            "================================================"
        );

        console.log(
            "[Leave] LEAVE BALANCES API RESPONSE:"
        );

        console.log(
            response
        );

        console.log(
            "[Leave] response.data:"
        );

        console.log(
            response?.data
        );

        console.log(
            "================================================"
        );


        workerLeaveBalances =
            extractResponseArray(
                response
            );


        console.log(
            "[Leave] Processed database balances:",
            workerLeaveBalances
        );


        if (
            workerLeaveBalances.length ===
            0
        ) {

            console.warn(
                "[Leave] Database returned ZERO balance rows."
            );

        }


        renderLeaveBalances();

        updateLeaveDayLimit();


    } catch (error) {

        console.error(
            "[Leave] Failed to load balances:",
            error
        );


        workerLeaveBalances =
            [];


        renderLeaveBalances();

        updateLeaveDayLimit();

    }

}


// ============================================================
// LOAD LEAVE REQUEST HISTORY
// ============================================================

async function loadLeaveRequests() {

    console.log(
        "[Leave] Loading leave request history..."
    );


    try {

        const response =
            await getWorkerLeaveRequests();


        console.log(
            "[Leave] LEAVE REQUESTS API RESPONSE:",
            response
        );


        workerLeaveRequests =
            extractResponseArray(
                response
            );


        console.log(
            "[Leave] Processed leave requests:",
            workerLeaveRequests
        );


        renderLeaveRequests(
            workerLeaveRequests
        );


        renderLeaveBalances();


    } catch (error) {

        console.error(
            "[Leave] Failed to load leave requests:",
            error
        );


        workerLeaveRequests =
            [];


        renderLeaveRequests(
            []
        );


        renderLeaveBalances();

    }

}


// ============================================================
// RESPONSE ARRAY HELPER
// ============================================================

function extractResponseArray(
    response
) {

    if (
        Array.isArray(
            response
        )
    ) {

        return response;

    }


    if (
        Array.isArray(
            response?.data
        )
    ) {

        return response.data;

    }


    if (
        Array.isArray(
            response?.rows
        )
    ) {

        return response.rows;

    }


    if (
        Array.isArray(
            response?.data?.rows
        )
    ) {

        return response.data.rows;

    }


    return [];

}


// ============================================================
// RENDER LEAVE TYPES FROM DATABASE
// ============================================================

function renderLeaveTypes() {

    const select =
        document.getElementById(
            "leaveType"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `
        <option value="">
            Select Leave Type
        </option>
    `;


    workerLeaveTypes.forEach(
        (type) => {

            const leaveTypeId =
                type.leaveTypeId ??
                type.leave_type_id;


            const leaveTypeName =
                type.leaveTypeName ??
                type.leave_type_name;


            if (
                leaveTypeId ===
                    undefined ||
                leaveTypeName ===
                    undefined
            ) {

                console.warn(
                    "[Leave] Invalid leave type:",
                    type
                );

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                leaveTypeId;


            option.textContent =
                leaveTypeName;


            select.appendChild(
                option
            );

        }
    );


    console.log(
        "[Leave] Dropdown populated with",
        select.options.length - 1,
        "database leave types."
    );

}


// ============================================================
// FALLBACK LEAVE TYPES
// ============================================================
//
// This is only used if the database/API is unavailable.
// Normal operation ALWAYS uses leave_types from MySQL.
// ============================================================

function renderFallbackLeaveTypes() {

    const select =
        document.getElementById(
            "leaveType"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `
        <option value="">
            Select Leave Type
        </option>

        <option value="1">
            Annual Leave
        </option>

        <option value="2">
            Sick Leave
        </option>

        <option value="3">
            Family Responsibility
        </option>

        <option value="4">
            Study Leave
        </option>

        <option value="5">
            Personal
        </option>

        <option value="6">
            Vacation
        </option>

        <option value="7">
            Medical Appointment
        </option>

        <option value="8">
            Bereavement
        </option>

        <option value="9">
            Childcare
        </option>
    `;

}


// ============================================================
// RENDER LEAVE BALANCES
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


    // --------------------------------------------------------
    // Reset displayed values.
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Display database values.
    // --------------------------------------------------------

    workerLeaveBalances.forEach(
        (balance) => {

            const leaveTypeName =
                String(
                    balance.leaveTypeName ??
                    balance.leave_type_name ??
                    ""
                )
                    .trim()
                    .toLowerCase();


            const elementId =
                balanceMap[
                    leaveTypeName
                ];


            console.log(
                "[Leave] Rendering balance:",
                {
                    leaveTypeName,
                    elementId,
                    balance
                }
            );


            if (!elementId) {

                console.warn(
                    "[Leave] No HTML element mapped for:",
                    leaveTypeName
                );

                return;

            }


            const element =
                document.getElementById(
                    elementId
                );


            if (!element) {

                console.warn(
                    `[Leave] #${elementId} does not exist in HTML.`
                );

                return;

            }


            const remainingDays =
                Number(
                    balance.remainingDays ??
                    balance.remaining_days ??
                    0
                );


            element.textContent =
                `${formatDays(
                    remainingDays
                )} days`;

        }
    );


    // --------------------------------------------------------
    // Pending request count.
    // --------------------------------------------------------

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
// GET SELECTED LEAVE BALANCE
// ============================================================

function getSelectedLeaveBalance() {

    const select =
        document.getElementById(
            "leaveType"
        );


    if (
        !select ||
        !select.value
    ) {

        return null;

    }


    const leaveTypeId =
        Number(
            select.value
        );


    const balance =
        workerLeaveBalances.find(
            (item) => {

                return Number(
                    item.leaveTypeId ??
                    item.leave_type_id
                ) ===
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
// UPDATE DAY LIMIT
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


        daysInput.setCustomValidity(
            ""
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
            `You only have ${formatDays(
                balance
            )} day(s) of ${
                getSelectedLeaveTypeName()
            } remaining.`
        );

    } else {

        daysInput.setCustomValidity(
            ""
        );

    }

}


// ============================================================
// DAY VALIDATION INITIALIZATION
// ============================================================

function initializeLeaveDayValidation() {

    const leaveType =
        document.getElementById(
            "leaveType"
        );


    const leaveDays =
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


    if (leaveType) {

        leaveType.addEventListener(
            "change",
            () => {

                updateLeaveDayLimit();

            }
        );

    }


    if (leaveDays) {

        leaveDays.addEventListener(
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
            syncDaysWithDates
        );

    }


    if (endDate) {

        endDate.addEventListener(
            "change",
            syncDaysWithDates
        );

    }

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
// SYNC DAYS FROM DATE RANGE
// ============================================================

function syncDaysWithDates() {

    const daysInput =
        document.getElementById(
            "leaveDays"
        );


    const startDate =
        document.getElementById(
            "startDate"
        )?.value;


    const endDate =
        document.getElementById(
            "endDate"
        )?.value;


    if (
        !daysInput ||
        !startDate ||
        !endDate
    ) {

        return;

    }


    const calculatedDays =
        calculateDaysFromDates(
            startDate,
            endDate
        );


    if (
        calculatedDays === null
    ) {

        return;

    }


    daysInput.value =
        calculatedDays;


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


    const requestedDays =
        Number(
            daysInput.value
        );


    const balance =
        getSelectedLeaveBalance();


    if (
        balance === null
    ) {

        daysInput.setCustomValidity(
            ""
        );


        return true;

    }


    if (
        !Number.isInteger(
            requestedDays
        ) ||
        requestedDays < 1
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


    if (
        requestedDays >
        balance
    ) {

        const message =
            `You only have ${formatDays(
                balance
            )} day(s) of ${
                getSelectedLeaveTypeName()
            } remaining.`;


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


            if (
                !Number.isInteger(
                    leaveDays
                ) ||
                leaveDays < 1
            ) {

                showToast(
                    "Please enter a valid number of leave days."
                );

                return;

            }


            if (!reason) {

                showToast(
                    "Please provide a reason."
                );

                return;

            }


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


            if (
                leaveDays !==
                calculatedDays
            ) {

                showToast(
                    `The selected dates equal ${calculatedDays} day(s). Please enter ${calculatedDays} in Total Days.`
                );

                return;

            }


            const balance =
                getSelectedLeaveBalance();


            if (
                balance === null
            ) {

                console.error(
                    "[Leave] No database balance found for leave type:",
                    leaveTypeId
                );

                console.error(
                    "[Leave] Available balances:",
                    workerLeaveBalances
                );


                showToast(
                    "Your balance for this leave type has not loaded. Please refresh the page and try again."
                );

                return;

            }


            if (
                leaveDays >
                balance
            ) {

                showToast(
                    `You only have ${formatDays(
                        balance
                    )} day(s) of ${
                        getSelectedLeaveTypeName()
                    } remaining.`
                );

                return;

            }


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
                    "[Leave] Submission response:",
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


                showLeaveModal(
                    request
                );


                form.reset();


                // Refresh only the data affected by submission.

                await Promise.allSettled([

                    loadLeaveBalances(),

                    loadLeaveRequests()

                ]);


            } catch (error) {

                console.error(
                    "[Leave] Submission error:",
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
// SHOW SUCCESS MODAL
// ============================================================

function showLeaveModal(
    request
) {

    if (!request) {

        return;

    }


    setText(
        "summaryType",
        request.leaveTypeName ||
        getSelectedLeaveTypeName() ||
        "Leave"
    );


    setText(
        "summaryDays",
        request.totalDays ??
        request.total_days ??
        "--"
    );


    setText(
        "summaryStart",
        formatDate(
            request.startDate ??
            request.start_date
        )
    );


    setText(
        "summaryEnd",
        formatDate(
            request.endDate ??
            request.end_date
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
            "active"
        );

        modal.classList.add(
            "show"
        );

    }

}


// ============================================================
// MODAL INITIALIZATION
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
            "active"
        );

        modal.classList.remove(
            "show"
        );

    }


    // Automatically switch to history.

    activateLeaveTab(
        "history"
    );


    renderLeaveRequests(
        workerLeaveRequests
    );

}


// ============================================================
// LEAVE TABS
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
// RENDER HISTORY
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
        !Array.isArray(
            requests
        ) ||
        requests.length ===
        0
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
                                ${escapeHTML(
                                    type
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        start
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        end
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    days
                                )}
                            </td>

                            <td>
                                <span class="status">
                                    ${escapeHTML(
                                        status
                                    )}
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


    const dateText =
        String(
            value
        ).substring(
            0,
            10
        );


    const date =
        new Date(
            `${dateText}T00:00:00`
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
        Number(
            value
        );


    if (
        Number.isInteger(
            number
        )
    ) {

        return String(
            number
        );

    }


    return number.toFixed(
        2
    );

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


    return String(
        value
    )
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

window.loadLeaveTypes =
    loadLeaveTypes;

window.loadLeaveBalances =
    loadLeaveBalances;

window.loadLeaveRequests =
    loadLeaveRequests;

window.loadLeaveData =
    async function () {

        await Promise.allSettled([

            loadLeaveTypes(),

            loadLeaveBalances(),

            loadLeaveRequests()

        ]);

    };

window.renderLeaveBalances =
    renderLeaveBalances;

window.renderLeaveRequests =
    renderLeaveRequests;
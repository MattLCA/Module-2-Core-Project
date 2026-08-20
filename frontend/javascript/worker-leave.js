// ============================================================
// ModernTech Worker Leave
// ============================================================
// Worker leave page only.
//
// Backend/API integration is intentionally postponed while
// backend naming is being finalized.
//
// For now, leave requests are stored in localStorage so the
// page remains functional.
//
// Later this file can use functions from worker_api.js for:
//
// GET  leave requests
// POST leave request
// ============================================================

console.log("Worker Leave JS connected.");


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeLeaveTabs();
    initializeLeavePage();

});


// ============================================================
// PAGE VARIABLES
// ============================================================

let leaveHistory = [];

let leaveEntitlements = {
    annual: 14,
    sick: 10,
    family: 3,
    study: 5,
    personal: 0,
    vacation: 0,
    medical: 0,
    bereavement: 0,
    childcare: 0
};


// ============================================================
// LEAVE TYPE → BALANCE CATEGORY
// ============================================================

const typeToCategory = {

    "Annual Leave": "annual",

    "Sick Leave": "sick",

    "Family Responsibility": "family",

    "Study Leave": "study",

    "Personal": "personal",

    "Vacation": "vacation",

    "Medical Appointment": "medical",

    "Bereavement": "bereavement",

    "Childcare": "childcare"

};


// ============================================================
// INITIALIZE LEAVE PAGE
// ============================================================

function initializeLeavePage() {

    const form =
        document.getElementById("leaveForm");

    const clearButton =
        document.getElementById("clearLeaveBtn");

    const closeModalButton =
        document.getElementById("closeModal");


    // --------------------------------------------------------
    // LOAD SAVED LEAVE DATA
    // --------------------------------------------------------

    const savedHistory =
        localStorage.getItem("employeeLeaveHistory");

    if (savedHistory) {

        try {

            leaveHistory =
                JSON.parse(savedHistory);

        } catch (error) {

            console.error(
                "Could not parse saved leave history.",
                error
            );

            leaveHistory = [];
        }

    } else {

        leaveHistory = [];

    }


    // --------------------------------------------------------
    // FORM SUBMIT
    // --------------------------------------------------------

    if (form) {

        form.addEventListener(
            "submit",
            handleLeaveSubmit
        );

    }


    // --------------------------------------------------------
    // CLEAR HISTORY
    // --------------------------------------------------------

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearLeaveHistory
        );

    }


    // --------------------------------------------------------
    // CLOSE MODAL
    // --------------------------------------------------------

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeLeaveModal
        );

    }


    // --------------------------------------------------------
    // FILTERS
    // --------------------------------------------------------

    initializeLeaveFilters();


    // --------------------------------------------------------
    // INITIAL RENDER
    // --------------------------------------------------------

    updateBalanceDisplay();
    renderLeaveTable(leaveHistory);

}


// ============================================================
// LEAVE TABS
// ============================================================

function initializeLeaveTabs() {

    const tabs =
        document.querySelectorAll(".leave-tab");

    const contents =
        document.querySelectorAll(".leave-content");


    tabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            const target =
                tab.dataset.tab;


            tabs.forEach((button) => {

                button.classList.remove("active");

            });


            contents.forEach((content) => {

                content.classList.remove("active");

            });


            tab.classList.add("active");


            const targetContent =
                document.getElementById(target);

            if (targetContent) {

                targetContent.classList.add("active");

            }

        });

    });

}


// ============================================================
// BALANCE DISPLAY
// ============================================================

function updateBalanceDisplay() {

    const balanceText =
        document.getElementById(
            "leaveBalanceText"
        );

    const pendingText =
        document.getElementById(
            "leavePendingText"
        );


    // Rejected requests do not count against balance.

    const activeRequests =
        leaveHistory.filter(
            (request) =>
                request.status !== "Rejected"
        );


    const categoryIds = {

        annual: "annualLeave",

        sick: "sickLeave",

        family: "familyLeave",

        study: "studyLeave",

        personal: "personalLeave",

        vacation: "vacationLeave",

        medical: "medicalLeave",

        bereavement: "bereavementLeave",

        childcare: "childcareLeave"

    };


    let aggregateRemaining = 0;


    Object.keys(categoryIds).forEach(
        (category) => {

            const used =
                activeRequests

                    .filter((request) => {

                        const requestType =
                            (request.type || "")
                                .trim();

                        return (
                            typeToCategory[
                                requestType
                            ] === category
                        );

                    })

                    .reduce(
                        (total, request) =>
                            total +
                            Number(
                                request.days || 0
                            ),
                        0
                    );


            const entitlement =
                Number(
                    leaveEntitlements[
                        category
                    ] || 0
                );


            const remaining =
                Math.max(
                    0,
                    entitlement - used
                );


            aggregateRemaining +=
                remaining;


            const element =
                document.getElementById(
                    categoryIds[category]
                );


            if (element) {

                element.textContent =
                    `${remaining} Days`;

            }

        }
    );


    if (balanceText) {

        balanceText.textContent =
            `${aggregateRemaining} days`;

    }


    if (pendingText) {

        pendingText.textContent =
            leaveHistory.filter(
                (request) =>
                    request.status === "Pending"
            ).length;

    }

}


// ============================================================
// RENDER TABLE
// ============================================================

function renderLeaveTable(records) {

    const tableBody =
        document.getElementById(
            "leaveTable"
        );


    if (!tableBody) {
        return;
    }


    if (!records.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No matching leave records.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = "";


    records.forEach((record) => {

        let statusClass =
            "leave-rejected";


        if (record.status === "Approved") {

            statusClass =
                "leave-approved";

        } else if (
            record.status === "Pending"
        ) {

            statusClass =
                "leave-pending";

        }


        const startDate =
            record.startDate ??
            record.start ??
            "-";


        const endDate =
            record.endDate ??
            record.end ??
            "-";


        tableBody.innerHTML += `
            <tr>

                <td>
                    ${escapeHTML(record.type)}
                </td>

                <td>
                    ${escapeHTML(startDate)}
                </td>

                <td>
                    ${escapeHTML(endDate)}
                </td>

                <td>
                    ${Number(record.days || 0)}
                </td>

                <td>
                    <span class="leave-status ${statusClass}">
                        ${escapeHTML(record.status)}
                    </span>
                </td>

            </tr>
        `;

    });

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

    const clearFilters =
        document.getElementById(
            "clearFilters"
        );


    if (filterType) {

        filterType.addEventListener(
            "change",
            filterLeaveTable
        );

    }


    if (filterStatus) {

        filterStatus.addEventListener(
            "change",
            filterLeaveTable
        );

    }


    if (fromDate) {

        fromDate.addEventListener(
            "change",
            filterLeaveTable
        );

    }


    if (toDate) {

        toDate.addEventListener(
            "change",
            filterLeaveTable
        );

    }


    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            () => {

                if (filterType) {
                    filterType.value = "All";
                }

                if (filterStatus) {
                    filterStatus.value = "All";
                }

                if (fromDate) {
                    fromDate.value = "";
                }

                if (toDate) {
                    toDate.value = "";
                }

                renderLeaveTable(
                    leaveHistory
                );

            }
        );

    }

}


// ============================================================
// FILTER LEAVE TABLE
// ============================================================

function filterLeaveTable() {

    let filtered =
        [...leaveHistory];


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


    const type =
        filterType
            ? filterType.value
            : "All";


    const status =
        filterStatus
            ? filterStatus.value
            : "All";


    const from =
        fromDate
            ? fromDate.value
            : "";


    const to =
        toDate
            ? toDate.value
            : "";


    if (type !== "All") {

        filtered =
            filtered.filter(
                (item) =>
                    item.type === type
            );

    }


    if (status !== "All") {

        filtered =
            filtered.filter(
                (item) =>
                    item.status === status
            );

    }


    if (from) {

        filtered =
            filtered.filter(
                (item) =>
                    getStartDate(item) >= from
            );

    }


    if (to) {

        filtered =
            filtered.filter(
                (item) =>
                    getStartDate(item) <= to
            );

    }


    renderLeaveTable(filtered);

}


// ============================================================
// HANDLE LEAVE SUBMISSION
// ============================================================

function handleLeaveSubmit(event) {

    event.preventDefault();


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


    const leaveReason =
        document.getElementById(
            "leaveReason"
        );


    const request = {

        type:
            leaveType
                ? leaveType.value
                : "",

        days:
            leaveDays
                ? Number(leaveDays.value)
                : 0,

        startDate:
            startDate
                ? startDate.value
                : "",

        endDate:
            endDate
                ? endDate.value
                : "",

        reason:
            leaveReason
                ? leaveReason.value.trim()
                : "",

        status:
            "Pending",

        createdAt:
            new Date().toISOString()

    };


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!request.type) {

        alert("Please select a leave type.");

        return;

    }


    if (request.days <= 0) {

        alert("Please enter a valid number of leave days.");

        return;

    }


    if (!request.startDate) {

        alert("Please select a start date.");

        return;

    }


    // --------------------------------------------------------
    // ADD REQUEST
    // --------------------------------------------------------

    leaveHistory.unshift(request);


    saveLeaveHistory();


    // --------------------------------------------------------
    // UPDATE MODAL
    // --------------------------------------------------------

    updateLeaveSummary(request);


    // --------------------------------------------------------
    // UPDATE PAGE
    // --------------------------------------------------------

    renderLeaveTable(
        leaveHistory
    );

    updateBalanceDisplay();


    // --------------------------------------------------------
    // SHOW MODAL
    // --------------------------------------------------------

    const modal =
        document.getElementById(
            "leaveModal"
        );


    if (modal) {

        modal.classList.add("show");

    }

}


// ============================================================
// UPDATE MODAL SUMMARY
// ============================================================

function updateLeaveSummary(request) {

    setLeaveText(
        "summaryType",
        request.type
    );

    setLeaveText(
        "summaryDays",
        `${request.days} Days`
    );

    setLeaveText(
        "summaryStart",
        request.startDate
    );

    setLeaveText(
        "summaryEnd",
        request.endDate || "-"
    );

    setLeaveText(
        "summaryReason",
        request.reason || "-"
    );

}


// ============================================================
// CLEAR LEAVE HISTORY
// ============================================================

function clearLeaveHistory() {

    const confirmed =
        window.confirm(
            "Are you sure you want to clear your leave history?"
        );


    if (!confirmed) {
        return;
    }


    leaveHistory = [];


    saveLeaveHistory();


    renderLeaveTable(
        leaveHistory
    );


    updateBalanceDisplay();

}


// ============================================================
// CLOSE LEAVE MODAL
// ============================================================

function closeLeaveModal() {

    const modal =
        document.getElementById(
            "leaveModal"
        );


    const form =
        document.getElementById(
            "leaveForm"
        );


    if (modal) {

        modal.classList.remove("show");

    }


    if (form) {

        form.reset();

    }


    // Reset to history tab

    const tabs =
        document.querySelectorAll(
            ".leave-tab"
        );


    const contents =
        document.querySelectorAll(
            ".leave-content"
        );


    tabs.forEach((tab) => {

        tab.classList.remove("active");

    });


    contents.forEach((content) => {

        content.classList.remove("active");

    });


    const historyTab =
        document.querySelector(
            '[data-tab="history"]'
        );


    const historyPanel =
        document.getElementById(
            "history"
        );


    if (historyTab) {

        historyTab.classList.add(
            "active"
        );

    }


    if (historyPanel) {

        historyPanel.classList.add(
            "active"
        );

    }

}


// ============================================================
// SAVE LEAVE HISTORY
// ============================================================

function saveLeaveHistory() {

    localStorage.setItem(
        "employeeLeaveHistory",
        JSON.stringify(leaveHistory)
    );

}


// ============================================================
// GET START DATE
// ============================================================

function getStartDate(record) {

    return (
        record.startDate ??
        record.start ??
        ""
    );

}


// ============================================================
// SAFE TEXT OUTPUT
// ============================================================

function setLeaveText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ??
        "Not available";

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
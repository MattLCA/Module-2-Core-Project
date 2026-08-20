// ============================================================
// ModernTech Worker Leave
// ============================================================

console.log("Worker Leave JS connected.");

document.addEventListener("DOMContentLoaded", () => {

    initializeLeaveTabs();
    initializeLeaveForm();
    initializeLeaveFilters();
    initializeLeaveModal();
    initializeClearLeave();

    renderLeaveState();

});


// ============================================================
// STATE
// ============================================================

let leaveHistory = [];

let leaveEntitlements = {
    annual: 0,
    sick: 0,
    family: 0,
    study: 0,
    personal: 0,
    vacation: 0,
    medical: 0,
    bereavement: 0,
    childcare: 0
};


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
// TABS
// ============================================================

function initializeLeaveTabs() {

    const tabs =
        document.querySelectorAll(".leave-tab");

    const contents =
        document.querySelectorAll(".leave-content");


    tabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            tabs.forEach((item) => {
                item.classList.remove("active");
            });

            contents.forEach((content) => {
                content.classList.remove("active");
            });


            tab.classList.add("active");


            const target =
                document.getElementById(
                    tab.dataset.tab
                );

            if (target) {
                target.classList.add("active");
            }

        });

    });
}


// ============================================================
// FORM
// ============================================================

function initializeLeaveForm() {

    const form =
        document.getElementById("leaveForm");

    if (!form) {
        return;
    }


    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const request = {

            type:
                document.getElementById(
                    "leaveType"
                )?.value || "",

            days:
                Number(
                    document.getElementById(
                        "leaveDays"
                    )?.value || 0
                ),

            startDate:
                document.getElementById(
                    "startDate"
                )?.value || "",

            endDate:
                document.getElementById(
                    "endDate"
                )?.value || "",

            reason:
                document.getElementById(
                    "leaveReason"
                )?.value.trim() || "",

            status: "Pending"

        };


        updateLeaveSummary(request);


        /*
         * Backend integration will eventually happen here.
         *
         * Example:
         *
         * await submitLeaveRequest(request);
         */


        console.log(
            "Leave request prepared:",
            request
        );


        showToast(
            "Leave request API integration is pending."
        );


        const modal =
            document.getElementById(
                "leaveModal"
            );

        if (modal) {
            modal.classList.add("show");
        }

    });
}


// ============================================================
// MODAL SUMMARY
// ============================================================

function updateLeaveSummary(request) {

    const summaryType =
        document.getElementById("summaryType");

    const summaryDays =
        document.getElementById("summaryDays");

    const summaryStart =
        document.getElementById("summaryStart");

    const summaryEnd =
        document.getElementById("summaryEnd");

    const summaryReason =
        document.getElementById("summaryReason");


    if (summaryType) {
        summaryType.textContent =
            request.type;
    }

    if (summaryDays) {
        summaryDays.textContent =
            `${request.days} Days`;
    }

    if (summaryStart) {
        summaryStart.textContent =
            request.startDate;
    }

    if (summaryEnd) {
        summaryEnd.textContent =
            request.endDate;
    }

    if (summaryReason) {
        summaryReason.textContent =
            request.reason;
    }
}


// ============================================================
// FILTERS
// ============================================================

function initializeLeaveFilters() {

    const filterType =
        document.getElementById("filterType");

    const filterStatus =
        document.getElementById("filterStatus");

    const fromDate =
        document.getElementById("fromDate");

    const toDate =
        document.getElementById("toDate");

    const clearFilters =
        document.getElementById("clearFilters");


    [
        filterType,
        filterStatus,
        fromDate,
        toDate
    ].forEach((element) => {

        if (element) {
            element.addEventListener(
                "change",
                filterLeaveTable
            );
        }

    });


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
// FILTER TABLE
// ============================================================

function filterLeaveTable() {

    let filtered =
        [...leaveHistory];


    const type =
        document.getElementById(
            "filterType"
        )?.value || "All";

    const status =
        document.getElementById(
            "filterStatus"
        )?.value || "All";

    const from =
        document.getElementById(
            "fromDate"
        )?.value || "";

    const to =
        document.getElementById(
            "toDate"
        )?.value || "";


    if (type !== "All") {

        filtered =
            filtered.filter(
                item => item.type === type
            );

    }


    if (status !== "All") {

        filtered =
            filtered.filter(
                item => item.status === status
            );

    }


    if (from) {

        filtered =
            filtered.filter(
                item => item.startDate >= from
            );

    }


    if (to) {

        filtered =
            filtered.filter(
                item => item.startDate <= to
            );

    }


    renderLeaveTable(filtered);
}


// ============================================================
// RENDER
// ============================================================

function renderLeaveState() {

    updateBalanceDisplay();

    renderLeaveTable(
        leaveHistory
    );

}


function renderLeaveTable(records) {

    const table =
        document.getElementById(
            "leaveTable"
        );

    if (!table) {
        return;
    }


    if (!records.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Leave records will load from the
                    database after backend integration
                    is finalized.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        records.map((record) => {

            let statusClass =
                "leave-rejected";


            if (
                record.status ===
                "Approved"
            ) {

                statusClass =
                    "leave-approved";

            } else if (
                record.status ===
                "Pending"
            ) {

                statusClass =
                    "leave-pending";

            }


            return `
                <tr>
                    <td>${record.type}</td>
                    <td>${record.startDate}</td>
                    <td>${record.endDate || "-"}</td>
                    <td>${record.days}</td>
                    <td>
                        <span class="leave-status ${statusClass}">
                            ${record.status}
                        </span>
                    </td>
                </tr>
            `;

        }).join("");
}


// ============================================================
// BALANCE
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


    const activeRequests =
        leaveHistory.filter(
            request =>
                request.status !==
                "Rejected"
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
                    .filter(
                        request =>
                            typeToCategory[
                                (request.type || "")
                                    .trim()
                            ] === category
                    )
                    .reduce(
                        (total, request) =>
                            total +
                            Number(
                                request.days || 0
                            ),
                        0
                    );


            const remaining =
                Math.max(
                    0,
                    Number(
                        leaveEntitlements[
                            category
                        ] || 0
                    ) - used
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
                request =>
                    request.status ===
                    "Pending"
            ).length;

    }
}


// ============================================================
// MODAL
// ============================================================

function initializeLeaveModal() {

    const modal =
        document.getElementById(
            "leaveModal"
        );

    const closeButton =
        document.getElementById(
            "closeModal"
        );


    if (!closeButton) {
        return;
    }


    closeButton.addEventListener(
        "click",
        () => {

            if (modal) {
                modal.classList.remove(
                    "show"
                );
            }

            const form =
                document.getElementById(
                    "leaveForm"
                );

            if (form) {
                form.reset();
            }

        }
    );
}


// ============================================================
// CLEAR
// ============================================================

function initializeClearLeave() {

    const button =
        document.getElementById(
            "clearLeaveBtn"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            /*
             * Database records should NOT be deleted from
             * the browser.
             *
             * This is intentionally disabled until the final
             * backend behaviour is agreed.
             */

            showToast(
                "Leave records are managed by the database."
            );

        }
    );
}
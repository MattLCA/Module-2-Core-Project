// ============================================================
// ModernTech Worker Leave
// ============================================================

console.log("Worker Leave JS connected.");


let workerLeaveTypes = [];
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

        initializeLeaveClearButton();


        await loadLeaveData();

    }
);


// ============================================================
// LOAD ALL LEAVE DATA
// ============================================================

async function loadLeaveData() {

    try {

        const [
            typesResponse,
            balancesResponse,
            requestsResponse
        ] = await Promise.all([
            getWorkerLeaveTypes(),
            getWorkerLeaveBalances(),
            getWorkerLeaveRequests()
        ]);


        workerLeaveTypes =
            typesResponse?.data ||
            [];


        workerLeaveBalances =
            balancesResponse?.data ||
            [];


        workerLeaveRequests =
            requestsResponse?.data ||
            [];


        renderLeaveTypes();

        renderLeaveBalances();

        renderLeaveRequests(
            workerLeaveRequests
        );


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
// LEAVE TYPES
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

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                type.leaveTypeId;


            option.textContent =
                type.leaveTypeName;


            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// BALANCES
// ============================================================

function renderLeaveBalances() {

    const map = {

        "Annual Leave":
            "annualLeave",

        "Sick Leave":
            "sickLeave",

        "Family Responsibility":
            "familyLeave",

        "Study Leave":
            "studyLeave",

        "Personal":
            "personalLeave",

        "Vacation":
            "vacationLeave",

        "Medical Appointment":
            "medicalLeave",

        "Bereavement":
            "bereavementLeave",

        "Childcare":
            "childcareLeave"

    };


    workerLeaveBalances.forEach(
        (balance) => {

            const id =
                map[
                    balance.leaveTypeName
                ];


            if (!id) {
                return;
            }


            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    `${Number(
                        balance.remainingDays || 0
                    )} days`;

            }

        }
    );


    const pending =
        workerLeaveRequests.filter(
            request =>
                String(
                    request.status
                ).toLowerCase() ===
                "pending"
        ).length;


    const pendingElement =
        document.getElementById(
            "leavePendingText"
        );


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }

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


            try {

                const leaveTypeId =
                    document.getElementById(
                        "leaveType"
                    )?.value;


                const startDate =
                    document.getElementById(
                        "startDate"
                    )?.value;


                const endDate =
                    document.getElementById(
                        "endDate"
                    )?.value;


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


                if (!reason) {

                    showToast(
                        "Please provide a reason."
                    );

                    return;
                }


                const start =
                    new Date(
                        `${startDate}T00:00:00`
                    );


                const end =
                    new Date(
                        `${endDate}T00:00:00`
                    );


                if (end < start) {

                    showToast(
                        "End date cannot be before start date."
                    );

                    return;
                }


                const totalDays =
                    Math.floor(
                        (
                            end -
                            start
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    ) + 1;


                const response =
                    await createWorkerLeaveRequest({
                        leaveTypeId:
                            Number(
                                leaveTypeId
                            ),

                        startDate,

                        endDate,

                        reason
                    });


                showLeaveModal(
                    response?.data
                );


                form.reset();


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

            }

        }
    );

}


// ============================================================
// MODAL
// ============================================================

function showLeaveModal(
    request
) {

    if (!request) {
        return;
    }


    const leaveType =
        workerLeaveTypes.find(
            type =>
                Number(
                    type.leaveTypeId
                ) ===
                Number(
                    request.leaveTypeId
                )
        );


    setText(
        "summaryType",
        leaveType?.leaveTypeName ||
        "Leave"
    );


    setText(
        "summaryDays",
        request.totalDays
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
            "active"
        );

    }

}


function initializeLeaveModal() {

    const modal =
        document.getElementById(
            "leaveModal"
        );


    const close =
        document.getElementById(
            "closeModal"
        );


    if (close) {

        close.addEventListener(
            "click",
            () => {

                modal?.classList.remove(
                    "active"
                );

            }
        );

    }

}


// ============================================================
// REQUEST HISTORY
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


    if (!requests.length) {

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
                request => `

                <tr
                    data-leave-type="${escapeHTML(
                        request.leaveTypeName
                    )}"
                    data-status="${escapeHTML(
                        request.status
                    )}"
                    data-start="${escapeHTML(
                        request.startDate
                    )}"
                >

                    <td>
                        ${escapeHTML(
                            request.leaveTypeName
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            formatDate(
                                request.startDate
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            formatDate(
                                request.endDate
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            request.totalDays
                        )}
                    </td>

                    <td>
                        <span class="status">
                            ${escapeHTML(
                                request.status
                            )}
                        </span>
                    </td>

                </tr>
            `
            )
            .join("");

}


// ============================================================
// FILTERS
// ============================================================

function initializeLeaveFilters() {

    [
        "filterType",
        "filterStatus",
        "fromDate",
        "toDate"
    ]
        .forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.addEventListener(
                        "change",
                        applyLeaveFilters
                    );

                }

            }
        );


    const clear =
        document.getElementById(
            "clearFilters"
        );


    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "filterType"
                ).value = "All";

                document.getElementById(
                    "filterStatus"
                ).value = "All";

                document.getElementById(
                    "fromDate"
                ).value = "";

                document.getElementById(
                    "toDate"
                ).value = "";


                renderLeaveRequests(
                    workerLeaveRequests
                );

            }
        );

    }

}


function applyLeaveFilters() {

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


    const filtered =
        workerLeaveRequests.filter(
            request => {

                if (
                    type !== "All" &&
                    request.leaveTypeName !== type
                ) {
                    return false;
                }


                if (
                    status !== "All" &&
                    request.status !== status
                ) {
                    return false;
                }


                if (
                    from &&
                    request.startDate < from
                ) {
                    return false;
                }


                if (
                    to &&
                    request.startDate > to
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
// TABS
// ============================================================

function initializeLeaveTabs() {

    const tabs =
        document.querySelectorAll(
            ".leave-tab"
        );


    const contents =
        document.querySelectorAll(
            ".leave-content"
        );


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    contents.forEach(
                        content =>
                            content.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    document
                        .getElementById(
                            target
                        )
                        ?.classList.add(
                            "active"
                        );

                }
            );

        }
    );

}


// ============================================================
// CLEAR BUTTON
// ============================================================

function initializeLeaveClearButton() {

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

            renderLeaveRequests(
                workerLeaveRequests
            );

            showToast(
                "Leave requests are stored in the database and cannot be deleted from this page."
            );

        }
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
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "--";

    }

}


function formatDate(
    value
) {

    if (!value) {
        return "--";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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


function escapeHTML(value) {

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
// GLOBAL
// ============================================================

window.loadLeaveData =
    loadLeaveData;

window.renderLeaveBalances =
    renderLeaveBalances;

window.renderLeaveRequests =
    renderLeaveRequests;


// ============================================================
// START MODAL
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeLeaveModal
);
console.log("Leave JS connected.");

document.addEventListener("DOMContentLoaded", () => {

    /*=====================================================
      VARIABLES
    =====================================================*/

    const tabs = document.querySelectorAll(".leave-tab");
    const contents = document.querySelectorAll(".leave-content");

    const form = document.getElementById("leaveForm");
    const modal = document.getElementById("leaveModal");
    const closeModalBtn = document.getElementById("closeModal");

    const tableBody = document.getElementById("leaveTable");
    const clearLeaveBtn = document.getElementById("clearLeaveBtn");

    let history = [];
    let leaveEntitlements = { annual: 0, sick: 0, family: 0, study: 0 };

    // Maps the leave type string used in the form/table to its balance category key.
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

    /*=====================================================
      BALANCE DISPLAY
    =====================================================*/

    function updateBalanceDisplay() {
        const balanceText = document.getElementById("leaveBalanceText");
        const pendingText = document.getElementById("leavePendingText");

        // Rejected requests don't count against the balance.
        const activeRequests = history.filter(r => r.status !== "Rejected");

        /*
          PER-CATEGORY BALANCES (computed first)
        */
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
        let unmatchedDaysUsed = 0;

        Object.keys(categoryIds).forEach((category) => {
            const usedInCategory = activeRequests
                .filter(r => typeToCategory[(r.type || "").trim()] === category)
                .reduce((total, r) => total + Number(r.days || 0), 0);

            const remainingInCategory = Math.max(0, leaveEntitlements[category] - usedInCategory);
            aggregateRemaining += remainingInCategory;

            const el = document.getElementById(categoryIds[category]);
            if (el) {
                el.textContent = remainingInCategory + " Days";
            }
        });

        // Flag any request whose type doesn't match a known category, so
        // bad data is visible instead of silently throwing the totals off.
        activeRequests.forEach((r) => {
            if (!typeToCategory[(r.type || "").trim()]) {
                unmatchedDaysUsed += Number(r.days || 0);
                console.warn("Leave request has an unrecognized type and was excluded from category balances:", r);
            }
        });

        /*
          AGGREGATE (derived from the per-category numbers above, so it
          can never disagree with them)
        */
        if (balanceText) {
            balanceText.textContent = aggregateRemaining + " days";
        }

        if (pendingText) {
            pendingText.textContent = history.filter(r => r.status === "Pending").length;
        }
    }

    /*=====================================================
      TABS
    =====================================================*/

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            contents.forEach((content) => content.classList.remove("active"));

            tab.classList.add("active");

            const target = tab.dataset.tab;
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });

    /*=====================================================
      LOAD JSON DATA
    =====================================================*/

    fetch("data/leave_data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Could not load leave data.");
            }
            return response.json();
        })
        .then((data) => {
            const employee = data.employeeLeave;

            /*
              LEAVE BALANCE
            */
            leaveEntitlements = {
                annual: employee.leaveBalance.annual,
                sick: employee.leaveBalance.sick,
                family: employee.leaveBalance.family,
                study: employee.leaveBalance.study,
                personal: employee.leaveBalance.personal || 0,
                vacation: employee.leaveBalance.vacation || 0,
                medical: employee.leaveBalance.medical || 0,
                bereavement: employee.leaveBalance.bereavement || 0,
                childcare: employee.leaveBalance.childcare || 0
            };

            /*
              LEAVE HISTORY
            */
            history = employee.leaveHistory;

            const savedHistory = localStorage.getItem("employeeLeaveHistory");
            if (savedHistory) {
                history = JSON.parse(savedHistory);
            }

            updateBalanceDisplay();
            renderTable(history);
        })
        .catch((error) => {
            console.error(error);
        });

    /*=====================================================
      RENDER HISTORY TABLE
    =====================================================*/

    function renderTable(records) {
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (!records.length) {
            tableBody.innerHTML = `<tr><td colspan="5">No matching leave records.</td></tr>`;
            return;
        }

        records.forEach((record) => {
            let statusClass = "";

            if (record.status === "Approved") {
                statusClass = "leave-approved";
            } else if (record.status === "Pending") {
                statusClass = "leave-pending";
            } else {
                statusClass = "leave-rejected";
            }

            tableBody.innerHTML += `
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
        });
    }

    /*=====================================================
      FILTERS
    =====================================================*/

    const filterType = document.getElementById("filterType");
    const filterStatus = document.getElementById("filterStatus");
    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");
    const clearFilters = document.getElementById("clearFilters");

    if (filterType) filterType.addEventListener("change", filterTable);
    if (filterStatus) filterStatus.addEventListener("change", filterTable);
    if (fromDate) fromDate.addEventListener("change", filterTable);
    if (toDate) toDate.addEventListener("change", filterTable);

    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            if (filterType) filterType.value = "All";
            if (filterStatus) filterStatus.value = "All";
            if (fromDate) fromDate.value = "";
            if (toDate) toDate.value = "";

            renderTable(history);
        });
    }

    function filterTable() {
        let filtered = [...history];

        const type = filterType ? filterType.value : "All";
        const status = filterStatus ? filterStatus.value : "All";
        const from = fromDate ? fromDate.value : "";
        const to = toDate ? toDate.value : "";

        if (type !== "All") {
            filtered = filtered.filter((item) => item.type === type);
        }

        if (status !== "All") {
            filtered = filtered.filter((item) => item.status === status);
        }

        if (from !== "") {
            filtered = filtered.filter((item) => item.startDate >= from);
        }

        if (to !== "") {
            filtered = filtered.filter((item) => item.startDate <= to);
        }

        renderTable(filtered);
    }

    /*=====================================================
      FORM SUBMIT
    =====================================================*/

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const request = {
                type: document.getElementById("leaveType").value,
                days: Number(document.getElementById("leaveDays").value),
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value,
                reason: document.getElementById("leaveReason").value,
                status: "Pending"
            };

            /*
              UPDATE MODAL WITH FORM DATA
            */
            const summaryType = document.getElementById("summaryType");
            const summaryDays = document.getElementById("summaryDays");
            const summaryStart = document.getElementById("summaryStart");
            const summaryEnd = document.getElementById("summaryEnd");
            const summaryReason = document.getElementById("summaryReason");

            if (summaryType) summaryType.textContent = request.type;
            if (summaryDays) summaryDays.textContent = request.days + " Days";
            if (summaryStart) summaryStart.textContent = request.startDate;
            if (summaryEnd) summaryEnd.textContent = request.endDate;
            if (summaryReason) summaryReason.textContent = request.reason;

            /*
              ADD REQUEST TO HISTORY TABLE
            */
            history.unshift(request);
            localStorage.setItem("employeeLeaveHistory", JSON.stringify(history));
            renderTable(history);
            updateBalanceDisplay();

            /*
              SHOW MODAL
            */
            if (modal) {
                modal.classList.add("show");
            }
        });
    }

    /*=====================================================
      CLEAR REQUESTS
    =====================================================*/

    if (clearLeaveBtn) {
        clearLeaveBtn.addEventListener("click", () => {
            history = [];
            // Persist an empty array rather than removing the key entirely —
            // removing it would make the next page load fall back to the
            // seed data in leave_data.json (including its pre-approved demo
            // records), making it look like leave was auto-added/approved.
            localStorage.setItem("employeeLeaveHistory", JSON.stringify([]));
            renderTable(history);
            updateBalanceDisplay();
        });
    }

    /*=====================================================
      CLOSE MODAL
    =====================================================*/

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            if (modal) {
                modal.classList.remove("show");
            }

            if (form) {
                form.reset();
            }

            tabs.forEach((tab) => tab.classList.remove("active"));
            contents.forEach((content) => content.classList.remove("active"));

            const historyTab = document.querySelector('[data-tab="history"]');
            if (historyTab) historyTab.classList.add("active");

            const historyPanel = document.getElementById("history");
            if (historyPanel) historyPanel.classList.add("active");
        });
    }

});
// ============================================================
// ModernTech Worker Profile
// ============================================================
// Worker profile page only.
//
// Backend/API integration is intentionally postponed while
// backend naming is being finalized.
//
// When the backend is ready, this file can call:
// getWorkerProfile()
// from worker_api.js.
// ============================================================

console.log("Worker Profile JS connected.");


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeProfileTabs();
    initializeProfilePage();
});


// ============================================================
// INITIALIZE PROFILE PAGE
// ============================================================

async function initializeProfilePage() {

    /*
     * Backend integration is intentionally NOT being called yet.
     *
     * Once your teammate finishes the backend naming, this can
     * become something like:
     *
     * const employee = await getWorkerProfile();
     * updateWorkerProfile(employee);
     */

    console.log("Worker profile page initialized.");
}


// ============================================================
// PROFILE TABS
// ============================================================

function initializeProfileTabs() {

    const tabs = document.querySelectorAll(".emp-profile-tab");
    const contents = document.querySelectorAll(".emp-profile-content");

    if (!tabs.length) {
        return;
    }

    tabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            const target = tab.dataset.tab;

            // Remove active state from all tabs
            tabs.forEach((button) => {
                button.classList.remove("active");
            });

            // Hide all content
            contents.forEach((content) => {
                content.classList.remove("active");
            });

            // Activate clicked tab
            tab.classList.add("active");

            // Show matching content
            const targetContent = document.getElementById(target);

            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });
}


// ============================================================
// UPDATE PROFILE
// ============================================================

function updateWorkerProfile(employee) {

    if (!employee) {
        console.warn("No employee profile data supplied.");
        return;
    }


    // --------------------------------------------------------
    // PERSONAL INFORMATION
    // --------------------------------------------------------

    setText(
        "empName",
        employee.name ??
        employee.full_name ??
        employee.fullName
    );

    setText(
        "empID",
        employee.employee_code ??
        employee.employeeCode ??
        employee.employee_id ??
        employee.employeeId
    );

    setText(
        "empDepartment",
        employee.department ??
        employee.department_name
    );

    setText(
        "empPosition",
        employee.position ??
        employee.position_name ??
        employee.job_title
    );

    setText(
        "empEmail",
        employee.email ??
        employee.email_address ??
        employee.contact
    );


    // --------------------------------------------------------
    // EMPLOYMENT STATUS
    // --------------------------------------------------------

    let status = "Full Time";

    if (
        employee.is_active === false ||
        employee.isActive === false
    ) {
        status = "Inactive";
    }

    if (employee.employment_status) {
        status = employee.employment_status;
    }

    if (employee.employmentStatus) {
        status = employee.employmentStatus;
    }

    setText("empStatus", status);


    // --------------------------------------------------------
    // SALARY
    // --------------------------------------------------------

    const salary =
        employee.base_salary ??
        employee.baseSalary ??
        employee.salary;

    if (
        salary !== undefined &&
        salary !== null
    ) {
        setText(
            "empSalary",
            formatCurrency(salary)
        );
    }


    // --------------------------------------------------------
    // SALARY DETAILS
    // --------------------------------------------------------

    setText(
        "empSalaryType",
        employee.salary_type ??
        employee.salaryType ??
        "Monthly"
    );

    setText(
        "empPaymentMethod",
        employee.payment_method ??
        employee.paymentMethod ??
        "Bank Transfer"
    );


    // --------------------------------------------------------
    // NEXT PAYDAY
    // --------------------------------------------------------

    if (
        employee.next_payday ||
        employee.nextPayday
    ) {
        setText(
            "empNextPayday",
            employee.next_payday ??
            employee.nextPayday
        );
    }


    // --------------------------------------------------------
    // WORK HISTORY
    // --------------------------------------------------------

    setText(
        "empHistory",
        employee.employment_history ??
        employee.employmentHistory ??
        "Current employment at ModernTech Solutions"
    );

    setText(
        "empDepartmentHistory",
        employee.department ??
        employee.department_name
    );

    setText(
        "empPositionHistory",
        employee.position ??
        employee.position_name ??
        employee.job_title
    );


    // --------------------------------------------------------
    // SIDEBAR
    // --------------------------------------------------------

    updateProfileSidebar(employee);
}


// ============================================================
// UPDATE SIDEBAR
// ============================================================

function updateProfileSidebar(employee) {

    if (!employee) {
        return;
    }

    const name =
        employee.name ??
        employee.full_name ??
        employee.fullName;

    const employeeCode =
        employee.employee_code ??
        employee.employeeCode ??
        employee.employee_id ??
        employee.employeeId;


    // --------------------------------------------------------
    // SUPPORT CURRENT + NEW SIDEBAR IDs
    // --------------------------------------------------------

    setText("sidebarWorkerName", name);
    setText("sidebarName", name);

    setText("sidebarEmployeeCode", employeeCode);
    setText("sidebarRole", employeeCode);


    // --------------------------------------------------------
    // AVATAR
    // --------------------------------------------------------

    const avatar =
        document.getElementById("sidebarAvatar") ||
        document.getElementById("sidebarInitials");

    if (avatar && name) {
        avatar.textContent = getInitials(name);
    }
}


// ============================================================
// SET TEXT SAFELY
// ============================================================

function setText(elementId, value) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        element.textContent = "Not available";
        return;
    }

    element.textContent = value;
}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    const number = Number(amount);

    if (Number.isNaN(number)) {
        return amount;
    }

    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        minimumFractionDigits: 2
    }).format(number);
}


// ============================================================
// GET INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return "--";
    }

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}
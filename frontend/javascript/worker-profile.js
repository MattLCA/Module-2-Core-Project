// ============================================================
// ModernTech Worker Profile
// ============================================================
// Responsibilities:
// - Profile tab switching
// - Profile display
// - Sidebar profile display
// - API-ready structure
//
// NOTE:
// Backend endpoint testing is intentionally postponed while
// backend naming is being finalized by the team.
//
// DO NOT fetch employee_info.json here.
// The database will eventually provide this information.
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
// PROFILE PAGE
// ============================================================

async function initializeProfilePage() {

    /*
        Backend integration is intentionally postponed.

        Once the backend naming is finalized, this function
        will call:

            getWorkerProfile()

        from:

            js/worker_api.js

        Example future implementation:

            const response = await getWorkerProfile();

            if (response && response.data) {
                updateWorkerProfile(response.data);
            }
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


            // Hide all profile sections

            contents.forEach((content) => {

                content.classList.remove("active");

            });


            // Activate clicked tab

            tab.classList.add("active");


            // Show selected section

            const targetContent =
                document.getElementById(target);


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

        console.warn(
            "No employee profile data supplied."
        );

        return;

    }


    // ========================================================
    // PERSONAL INFORMATION
    // ========================================================

    setText(
        "empName",
        employee.name
    );


    setText(
        "empID",
        getEmployeeCode(employee)
    );


    setText(
        "empDepartment",
        employee.department
    );


    setText(
        "empPosition",
        employee.position
    );


    setText(
        "empEmail",
        employee.email ??
        employee.contact
    );


    // ========================================================
    // EMPLOYMENT STATUS
    // ========================================================

    const employmentStatus =
        employee.is_active === false ||
        employee.isActive === false
            ? "Inactive"
            : "Full Time";


    setText(
        "empStatus",
        employmentStatus
    );


    // ========================================================
    // SALARY
    // ========================================================

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


    // ========================================================
    // SALARY TYPE
    // ========================================================

    const salaryType =
        employee.salary_type ??
        employee.salaryType;


    if (salaryType) {

        setText(
            "empSalaryType",
            salaryType
        );

    }


    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    const paymentMethod =
        employee.payment_method ??
        employee.paymentMethod;


    if (paymentMethod) {

        setText(
            "empPaymentMethod",
            paymentMethod
        );

    }


    // ========================================================
    // NEXT PAYDAY
    // ========================================================

    if (employee.next_payday) {

        setText(
            "empNextPayday",
            employee.next_payday
        );

    }


    if (employee.nextPayday) {

        setText(
            "empNextPayday",
            employee.nextPayday
        );

    }


    // ========================================================
    // WORK HISTORY
    // ========================================================

    setText(
        "empHistory",
        employee.employment_history ??
        employee.employmentHistory ??
        "Current employee at ModernTech Solutions"
    );


    setText(
        "empDepartmentHistory",
        employee.department
    );


    setText(
        "empPositionHistory",
        employee.position
    );


    // ========================================================
    // SIDEBAR
    // ========================================================

    updateProfileSidebar(employee);

}


// ============================================================
// GET EMPLOYEE CODE
// ============================================================

function getEmployeeCode(employee) {

    if (!employee) {
        return null;
    }


    return (
        employee.employee_code ??
        employee.employeeCode ??
        employee.employee_id ??
        employee.employeeId
    );

}


// ============================================================
// UPDATE SIDEBAR
// ============================================================

function updateProfileSidebar(employee) {

    if (!employee) {
        return;
    }


    // --------------------------------------------------------
    // Current HTML uses:
    //
    // .sidebar-footer .name
    // .sidebar-footer .role
    // .sidebar-footer .avatar
    //
    // Therefore we support both the new IDs and the
    // existing classes.
    // --------------------------------------------------------

    const sidebarName =
        document.getElementById("sidebarWorkerName") ||
        document.querySelector(".sidebar-footer .name");


    const sidebarRole =
        document.getElementById("sidebarEmployeeCode") ||
        document.querySelector(".sidebar-footer .role");


    const sidebarAvatar =
        document.getElementById("sidebarAvatar") ||
        document.querySelector(".sidebar-footer .avatar");


    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    if (sidebarName) {

        sidebarName.textContent =
            employee.name ??
            "Worker";

    }


    // --------------------------------------------------------
    // Employee Code
    // --------------------------------------------------------

    if (sidebarRole) {

        sidebarRole.textContent =
            getEmployeeCode(employee) ??
            "Employee";

    }


    // --------------------------------------------------------
    // Avatar
    // --------------------------------------------------------

    if (
        sidebarAvatar &&
        employee.name
    ) {

        sidebarAvatar.textContent =
            getInitials(employee.name);

    }

}


// ============================================================
// SAFE TEXT UPDATE
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

        element.textContent =
            "Not available";

        return;

    }


    element.textContent = value;

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    const number =
        Number(amount);


    if (Number.isNaN(number)) {

        return amount;

    }


    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2
        }
    ).format(number);

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

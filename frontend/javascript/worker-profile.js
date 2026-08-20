// ============================================================
// ModernTech Worker Profile
// API-ready version
//
// NOTE:
// Backend endpoint testing is intentionally postponed.
// The API function is called only when the backend naming
// changes are finalized.
// ============================================================

console.log("Worker Profile JS connected");


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
     * Authentication/API loading is intentionally prepared
     * but not forced while the backend naming is changing.
     *
     * Once the backend is finalized, this function will call:
     *
     * getWorkerProfile()
     *
     * from worker_api.js.
     */

    console.log(
        "Worker profile page initialized."
    );

}


// ============================================================
// PROFILE TABS
// ============================================================

function initializeProfileTabs() {

    const tabs =
        document.querySelectorAll(
            ".emp-profile-tab"
        );

    const contents =
        document.querySelectorAll(
            ".emp-profile-content"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const target =
                    tab.dataset.tab;


                // Remove active state
                // from all tabs

                tabs.forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });


                // Hide all content

                contents.forEach(content => {

                    content.classList.remove(
                        "active"
                    );

                });


                // Activate clicked tab

                tab.classList.add(
                    "active"
                );


                // Activate matching content

                const targetContent =
                    document.getElementById(
                        target
                    );


                if (targetContent) {

                    targetContent.classList.add(
                        "active"
                    );

                }

            }
        );

    });

}


// ============================================================
// UPDATE PROFILE
//
// This function is ready for the final backend response.
//
// We are deliberately keeping the field mapping flexible
// until your teammate finishes the backend naming.
// ============================================================

function updateWorkerProfile(employee) {

    if (!employee) {

        console.warn(
            "No employee profile data supplied."
        );

        return;
    }


    // --------------------------------------------------------
    // PERSONAL INFORMATION
    // --------------------------------------------------------

    setText(
        "empName",
        employee.name
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


    // --------------------------------------------------------
    // EMPLOYMENT STATUS
    // --------------------------------------------------------

    const status =
        employee.is_active === false ||
        employee.isActive === false
            ? "Inactive"
            : "Full Time";


    setText(
        "empStatus",
        status
    );


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
    // SALARY INFORMATION
    // --------------------------------------------------------

    if (employee.salary_type) {

        setText(
            "empSalaryType",
            employee.salary_type
        );

    }


    if (employee.salaryType) {

        setText(
            "empSalaryType",
            employee.salaryType
        );

    }


    if (employee.payment_method) {

        setText(
            "empPaymentMethod",
            employee.payment_method
        );

    }


    if (employee.paymentMethod) {

        setText(
            "empPaymentMethod",
            employee.paymentMethod
        );

    }


    // --------------------------------------------------------
    // WORK HISTORY
    // --------------------------------------------------------

    setText(
        "empHistory",
        employee.employment_history ??
        employee.employmentHistory
    );


    setText(
        "empDepartmentHistory",
        employee.department
    );


    setText(
        "empPositionHistory",
        employee.position
    );


    // --------------------------------------------------------
    // SIDEBAR
    // --------------------------------------------------------

    updateProfileSidebar(
        employee
    );

}


// ============================================================
// UPDATE SIDEBAR
// ============================================================

function updateProfileSidebar(employee) {

    if (!employee) {
        return;
    }


    // Name

    setText(
        "sidebarWorkerName",
        employee.name
    );


    // Employee code

    const employeeCode =
        employee.employee_code ??
        employee.employeeCode ??
        employee.employee_id ??
        employee.employeeId;


    setText(
        "sidebarEmployeeCode",
        employeeCode
    );


    // Avatar

    const avatar =
        document.getElementById(
            "sidebarAvatar"
        );


    if (
        avatar &&
        employee.name
    ) {

        avatar.textContent =
            getInitials(
                employee.name
            );

    }

}


// ============================================================
// SET TEXT SAFELY
// ============================================================

function setText(
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


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        element.textContent =
            "Not available";

        return;
    }


    element.textContent =
        value;

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(amount) {

    const number =
        Number(amount);


    if (
        Number.isNaN(number)
    ) {

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
        .map(
            part =>
                part.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}
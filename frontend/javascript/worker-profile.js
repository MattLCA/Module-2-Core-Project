// ============================================================
// ModernTech Worker Profile
// ============================================================

console.log("Worker Profile JS connected.");


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (
            typeof requireWorkerLogin === "function" &&
            !requireWorkerLogin()
        ) {
            return;
        }

        await initializeProfile();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

async function initializeProfile() {

    try {

        const response =
            await getWorkerProfile();

        console.log(
            "Worker profile:",
            response
        );


        const profile =
            response?.data ||
            response;


        if (!profile) {

            throw new Error(
                "Employee profile was not returned."
            );

        }


        saveLoggedInWorker(
            profile
        );


        renderProfile(
            profile
        );


        updateSidebarEmployee(
            profile
        );


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        showToast(
            error.message ||
            "Could not load your profile."
        );

    }

}


// ============================================================
// RENDER PROFILE
// ============================================================

function renderProfile(profile) {

    if (!profile) {
        return;
    }


    const name =
        profile.name ||
        "Worker";


    const employeeCode =
        profile.employeeCode ||
        profile.employeeId ||
        "--";


    const department =
        profile.departmentName ||
        "--";


    const position =
        profile.positionName ||
        "--";


    const email =
        profile.email ||
        "--";


    const status =
        profile.isActive
            ? "Active"
            : "Inactive";


    const salary =
        Number(
            profile.baseSalary || 0
        );


    const history =
        profile.employmentHistory ||
        "No employment history available.";


    // --------------------------------------------------------
    // Personal information
    // --------------------------------------------------------

    setText(
        "empName",
        name
    );

    setText(
        "empID",
        employeeCode
    );

    setText(
        "empDepartment",
        department
    );

    setText(
        "empPosition",
        position
    );

    setText(
        "empEmail",
        email
    );

    setText(
        "empStatus",
        status
    );


    // --------------------------------------------------------
    // Salary
    // --------------------------------------------------------

    setText(
        "empSalary",
        formatCurrency(salary)
    );


    setText(
        "empSalaryType",
        "Monthly"
    );


    setText(
        "empPaymentMethod",
        "Bank Transfer"
    );


    setText(
        "empNextPayday",
        getNextPayday()
    );


    // --------------------------------------------------------
    // History
    // --------------------------------------------------------

    setText(
        "empHistory",
        history
    );

    setText(
        "empDepartmentHistory",
        department
    );

    setText(
        "empPositionHistory",
        position
    );

}


// ============================================================
// SAFE TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value ?? "--";
}


// ============================================================
// NEXT PAYDAY
// ============================================================

function getNextPayday() {

    const today =
        new Date();

    let payday =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            25
        );


    if (today > payday) {

        payday =
            new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                25
            );

    }


    return payday.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
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


    tabs.forEach(
        (tab) => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;


                    tabs.forEach(
                        (item) =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    contents.forEach(
                        (content) =>
                            content.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


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

        }
    );

}


// ============================================================
// GLOBAL
// ============================================================

window.initializeProfile =
    initializeProfile;

window.renderProfile =
    renderProfile;


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeProfileTabs
);
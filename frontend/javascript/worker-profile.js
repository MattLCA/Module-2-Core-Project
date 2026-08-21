// ============================================================
// ModernTech Worker Profile
// ============================================================
//
// Connects the Worker Profile page to the backend API.
//
// Backend endpoint:
// GET  /api/worker/profile
// PUT  /api/worker/profile
//
// Authentication:
// JWT token from localStorage["token"]
//
// ============================================================

console.log("Worker Profile JS connected.");


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    // Make sure the worker is authenticated.
    if (typeof requireWorkerLogin === "function") {

        if (!requireWorkerLogin()) {
            return;
        }

    }

    // Load the profile from the backend.
    await initializeProfile();

});


// ============================================================
// INITIALIZE PROFILE
// ============================================================

async function initializeProfile() {

    try {

        // Load the logged-in worker from the API.
        const response = await getWorkerProfile();

        console.log(
            "Worker profile response:",
            response
        );

        const profile =
            getResponseData(response);

        if (!profile) {

            console.error(
                "No employee profile returned from API."
            );

            showToast(
                "Could not load your profile."
            );

            return;

        }

        // Store the latest employee information.
        if (typeof saveLoggedInWorker === "function") {

            saveLoggedInWorker(profile);

        }

        // Also keep the shared localStorage copy updated.
        localStorage.setItem(
            "employee",
            JSON.stringify(profile)
        );

        // Update the sidebar.
        if (
            typeof updateSidebarEmployee ===
            "function"
        ) {

            updateSidebarEmployee(profile);

        }

        // Display the profile.
        renderProfile(profile);

    } catch (error) {

        console.error(
            "Could not load worker profile:",
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


    // --------------------------------------------------------
    // NAME
    // --------------------------------------------------------

    const fullName =
        profile.name ||
        profile.fullName ||
        (
            profile.first_name &&
            profile.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : ""
        ) ||
        "Worker";


    // --------------------------------------------------------
    // EMPLOYEE CODE
    // --------------------------------------------------------

    const employeeCode =
        profile.employee_code ||
        profile.employeeCode ||
        profile.employee_id ||
        profile.employeeId ||
        "";


    // --------------------------------------------------------
    // BASIC INFORMATION
    // --------------------------------------------------------

    setElementText(
        [
            "profileName",
            "employeeName",
            "fullName",
            "displayName"
        ],
        fullName
    );


    setElementText(
        [
            "profileEmployeeCode",
            "employeeCode",
            "profileCode"
        ],
        employeeCode
    );


    setElementText(
        [
            "profileEmail",
            "employeeEmail",
            "email"
        ],
        profile.email
    );


    setElementText(
        [
            "profilePhone",
            "employeePhone",
            "phone",
            "phoneNumber"
        ],
        profile.phone ||
        profile.phone_number
    );


    // --------------------------------------------------------
    // JOB INFORMATION
    // --------------------------------------------------------

    setElementText(
        [
            "profileDepartment",
            "department"
        ],
        getNestedName(
            profile.department
        ) ||
        profile.department_name
    );


    setElementText(
        [
            "profilePosition",
            "position",
            "jobTitle",
            "job_title"
        ],
        getNestedName(
            profile.position
        ) ||
        profile.position_name ||
        profile.job_title
    );


    setElementText(
        [
            "profileRole",
            "role"
        ],
        profile.role
    );


    // --------------------------------------------------------
    // OTHER INFORMATION
    // --------------------------------------------------------

    setElementText(
        [
            "profileStatus",
            "employmentStatus",
            "status"
        ],
        profile.status ||
        profile.employment_status
    );


    setElementText(
        [
            "profileHireDate",
            "hireDate",
            "hire_date"
        ],
        formatProfileDate(
            profile.hire_date ||
            profile.hireDate
        )
    );


    setElementText(
        [
            "profileAddress",
            "address"
        ],
        profile.address
    );


    setElementText(
        [
            "profileCity",
            "city"
        ],
        profile.city
    );


    setElementText(
        [
            "profileCountry",
            "country"
        ],
        profile.country
    );


    // --------------------------------------------------------
    // AVATAR
    // --------------------------------------------------------

    updateProfileAvatar(
        fullName
    );


    // --------------------------------------------------------
    // INPUT FIELDS
    // --------------------------------------------------------

    populateInput(
        [
            "profileFirstName",
            "firstName",
            "first_name"
        ],
        profile.first_name ||
        profile.firstName
    );


    populateInput(
        [
            "profileLastName",
            "lastName",
            "last_name"
        ],
        profile.last_name ||
        profile.lastName
    );


    populateInput(
        [
            "profileEmailInput",
            "emailInput"
        ],
        profile.email
    );


    populateInput(
        [
            "profilePhoneInput",
            "phoneInput"
        ],
        profile.phone ||
        profile.phone_number
    );


    populateInput(
        [
            "profileAddressInput",
            "addressInput"
        ],
        profile.address
    );

}


// ============================================================
// SET TEXT HELPER
// ============================================================

function setElementText(
    ids,
    value
) {

    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return;
    }


    ids.forEach((id) => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.textContent =
            String(value);

    });

}


// ============================================================
// INPUT HELPER
// ============================================================

function populateInput(
    ids,
    value
) {

    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    if (
        value === null ||
        value === undefined
    ) {
        return;
    }


    ids.forEach((id) => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        // Do not overwrite an element that isn't an input.
        if (
            element.tagName !== "INPUT" &&
            element.tagName !== "TEXTAREA" &&
            element.tagName !== "SELECT"
        ) {
            return;
        }

        element.value =
            String(value);

    });

}


// ============================================================
// NESTED NAME HELPER
// ============================================================

function getNestedName(value) {

    if (!value) {
        return "";
    }


    if (typeof value === "string") {
        return value;
    }


    if (typeof value === "object") {

        return (
            value.name ||
            value.title ||
            value.department_name ||
            value.position_name ||
            ""
        );

    }


    return "";

}


// ============================================================
// PROFILE AVATAR
// ============================================================

function updateProfileAvatar(name) {

    const avatarIds = [
        "profileAvatar",
        "avatar",
        "profileImage"
    ];


    avatarIds.forEach((id) => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }


        // If this is an image, don't replace it
        // with text.
        if (
            element.tagName === "IMG"
        ) {

            return;

        }


        if (
            typeof getInitials ===
            "function"
        ) {

            element.textContent =
                getInitials(name);

        }

    });

}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatProfileDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    if (
        typeof formatDate ===
        "function"
    ) {

        return formatDate(
            dateValue
        );

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

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


// ============================================================
// EDIT PROFILE
// ============================================================
//
// This function collects editable profile fields and sends
// them to:
//
// PUT /api/worker/profile
//
// It is intentionally flexible so it works whether your
// HTML uses the original IDs or the newer IDs.
// ============================================================

async function saveWorkerProfile() {

    try {

        const profileData = {};


        // ----------------------------------------------------
        // FIRST NAME
        // ----------------------------------------------------

        const firstName =
            getInputValue([
                "profileFirstName",
                "firstName",
                "first_name"
            ]);

        if (firstName) {

            profileData.first_name =
                firstName;

        }


        // ----------------------------------------------------
        // LAST NAME
        // ----------------------------------------------------

        const lastName =
            getInputValue([
                "profileLastName",
                "lastName",
                "last_name"
            ]);

        if (lastName) {

            profileData.last_name =
                lastName;

        }


        // ----------------------------------------------------
        // EMAIL
        // ----------------------------------------------------

        const email =
            getInputValue([
                "profileEmailInput",
                "emailInput"
            ]);

        if (email) {

            profileData.email =
                email;

        }


        // ----------------------------------------------------
        // PHONE
        // ----------------------------------------------------

        const phone =
            getInputValue([
                "profilePhoneInput",
                "phoneInput"
            ]);

        if (phone) {

            profileData.phone =
                phone;

        }


        // ----------------------------------------------------
        // ADDRESS
        // ----------------------------------------------------

        const address =
            getInputValue([
                "profileAddressInput",
                "addressInput"
            ]);

        if (address) {

            profileData.address =
                address;

        }


        console.log(
            "Updating worker profile:",
            profileData
        );


        // ----------------------------------------------------
        // SEND TO BACKEND
        // ----------------------------------------------------

        const response =
            await updateWorkerProfile(
                profileData
            );


        console.log(
            "Updated worker profile:",
            response
        );


        // ----------------------------------------------------
        // Get updated employee
        // ----------------------------------------------------

        const updatedProfile =
            getResponseData(
                response
            );


        if (updatedProfile) {

            localStorage.setItem(
                "employee",
                JSON.stringify(
                    updatedProfile
                )
            );


            if (
                typeof saveLoggedInWorker ===
                "function"
            ) {

                saveLoggedInWorker(
                    updatedProfile
                );

            }


            if (
                typeof updateSidebarEmployee ===
                "function"
            ) {

                updateSidebarEmployee(
                    updatedProfile
                );

            }


            renderProfile(
                updatedProfile
            );

        }


        showToast(
            "Profile updated successfully."
        );


    } catch (error) {

        console.error(
            "Could not update profile:",
            error
        );

        showToast(
            error.message ||
            "Could not update your profile."
        );

    }

}


// ============================================================
// INPUT VALUE HELPER
// ============================================================

function getInputValue(ids) {

    if (!Array.isArray(ids)) {
        ids = [ids];
    }


    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (!element) {
            continue;
        }


        if (
            element.value !==
            undefined
        ) {

            return element.value.trim();

        }

    }


    return "";

}


// ============================================================
// CONNECT SAVE BUTTONS
// ============================================================

function initializeProfileSaveButtons() {

    const possibleButtons = [
        "saveProfileBtn",
        "saveBtn",
        "updateProfileBtn",
        "editProfileSaveBtn"
    ];


    possibleButtons.forEach(
        (id) => {

            const button =
                document.getElementById(
                    id
                );

            if (!button) {
                return;
            }


            // Prevent duplicate listeners.
            if (
                button.dataset.profileListener ===
                "true"
            ) {
                return;
            }


            button.dataset.profileListener =
                "true";


            button.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();

                    await saveWorkerProfile();

                }
            );

        }
    );

}


// ============================================================
// PROFILE FORM
// ============================================================

function initializeProfileForm() {

    const forms =
        document.querySelectorAll(
            "form"
        );


    forms.forEach(
        (form) => {

            // Only attach to forms that contain
            // profile-related inputs.
            const hasProfileInput =
                form.querySelector(
                    "#profileFirstName, #firstName, #profileLastName, #lastName, #profileEmailInput, #emailInput, #profilePhoneInput, #phoneInput"
                );


            if (!hasProfileInput) {
                return;
            }


            if (
                form.dataset.profileListener ===
                "true"
            ) {
                return;
            }


            form.dataset.profileListener =
                "true";


            form.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();

                    await saveWorkerProfile();

                }
            );

        }
    );

}


// ============================================================
// RUN FORM SETUP
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeProfileSaveButtons();

        initializeProfileForm();

    }
);


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.initializeProfile =
    initializeProfile;

window.renderProfile =
    renderProfile;

window.saveWorkerProfile =
    saveWorkerProfile;
// ============================================================
// ModernTech Worker Portal
// Logout
// ============================================================
//
// This file is responsible ONLY for the logout button.
//
// API functions are handled by:
// worker_api.js
//
// Shared functionality is handled by:
// script.js
// ============================================================


document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn =
        document.getElementById("logoutBtn");


    // --------------------------------------------------------
    // Stop if this page does not contain a logout button
    // --------------------------------------------------------

    if (!logoutBtn) {
        return;
    }


    // --------------------------------------------------------
    // Prevent duplicate listeners
    // --------------------------------------------------------

    if (logoutBtn.dataset.logoutInitialized === "true") {
        return;
    }

    logoutBtn.dataset.logoutInitialized = "true";


    // --------------------------------------------------------
    // Logout
    // --------------------------------------------------------

    logoutBtn.addEventListener("click", async () => {

        // Prevent multiple clicks
        logoutBtn.disabled = true;


        // Optional visual feedback
        const originalContent =
            logoutBtn.innerHTML;

        logoutBtn.innerHTML = `
            <i class="ti ti-loader-2" aria-hidden="true"></i>
            Logging out...
        `;


        try {

            // ------------------------------------------------
            // Use the API layer's logout function
            // ------------------------------------------------

            if (
                typeof window.workerLogout === "function"
            ) {

                await window.workerLogout();

            } else {

                // ------------------------------------------------
                // Fallback if worker_api.js is unavailable
                // ------------------------------------------------

                localStorage.removeItem("token");
                localStorage.removeItem("employee");

            }


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            // ------------------------------------------------
            // Always remove authentication information
            // ------------------------------------------------

            localStorage.removeItem("token");
            localStorage.removeItem("workerToken");
            localStorage.removeItem("authToken");
            localStorage.removeItem("loggedInUser");

            // ------------------------------------------------
            // Do NOT remove unrelated worker data here.
            //
            // Attendance, leave, notification and profile
            // data should be controlled by the backend.
            // ------------------------------------------------

            // ------------------------------------------------
            // Redirect to login
            // ------------------------------------------------

            window.location.href = "index.html";

        }

    });

});
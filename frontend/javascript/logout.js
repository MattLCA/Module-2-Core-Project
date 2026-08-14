document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            // Remove logged in user
            localStorage.removeItem("loggedInUser");

            // Prevent user from returning with Back button
            window.location.replace("index.html");
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const identifierInput = document.getElementById("loginIdentifier");
    const identifierLabel = document.getElementById("loginIdentifierLabel");
    const identifierIcon = document.getElementById("loginIdentifierIcon");
    const roleInputs = document.querySelectorAll('input[name="role"]');


    // ============================================================
    // UPDATE IDENTIFIER FIELD WHEN ROLE CHANGES
    // ============================================================

    roleInputs.forEach((roleInput) => {

        roleInput.addEventListener("change", () => {

            if (
                roleInput.value === "Employee" &&
                roleInput.checked
            ) {

                identifierLabel.textContent = "Employee ID";

                identifierInput.type = "text";

                identifierInput.placeholder = "EMP-001";

                identifierInput.value = "";

                identifierInput.autocomplete = "username";

                identifierIcon.className = "ti ti-id";

            } else {

                identifierLabel.textContent = "Email Address";

                identifierInput.type = "email";

                identifierInput.placeholder =
                    "Enter your email address";

                identifierInput.value = "";

                identifierInput.autocomplete = "username";

                identifierIcon.className = "ti ti-mail";

            }

        });

    });


    // ============================================================
    // LOGIN
    // ============================================================

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // --------------------------------------------------------
        // Get selected frontend role
        // --------------------------------------------------------

        const selectedRoleInput =
            document.querySelector(
                'input[name="role"]:checked'
            );

        if (!selectedRoleInput) {

            showMessage(
                "Please select a login role.",
                "error"
            );

            return;

        }


        const selectedRole =
            selectedRoleInput.value;


        // --------------------------------------------------------
        // Convert frontend role to backend role
        // --------------------------------------------------------

        const role =
            selectedRole === "HR Manager"
                ? "hr"
                : "worker";


        // --------------------------------------------------------
        // Get form values
        // --------------------------------------------------------

        const identifier =
            identifierInput.value.trim();

        const password =
            passwordInput.value;


        // --------------------------------------------------------
        // Basic validation
        // --------------------------------------------------------

        if (!identifier || !password) {

            showMessage(
                "Please enter your login details.",
                "error"
            );

            return;

        }


        // --------------------------------------------------------
        // Disable login button
        // --------------------------------------------------------

        const loginButton =
            loginForm.querySelector(".login-btn");

        const originalButtonText =
            loginButton.innerHTML;

        loginButton.disabled = true;

        loginButton.innerHTML = `
            <span>Signing in...</span>
            <i class="ti ti-loader-2"></i>
        `;


        try {

            // ----------------------------------------------------
            // Clear old authentication information
            // ----------------------------------------------------

            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("workerToken");
            localStorage.removeItem("employee");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("userRole");
            localStorage.removeItem("workerProfile");


            // ----------------------------------------------------
            // Send login request
            // ----------------------------------------------------

            const response = await fetch(
                "http://localhost:4000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        role: role,
                        identifier: identifier,
                        password: password
                    })
                }
            );


            // ----------------------------------------------------
            // Read response
            // ----------------------------------------------------

            const result =
                await response.json();


            console.log(
                "Login response:",
                result
            );


            // ----------------------------------------------------
            // Handle failed login
            // ----------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    result.message ||
                    "Login failed. Please check your details."
                );

            }


            // ----------------------------------------------------
            // Extract authenticated user
            // ----------------------------------------------------

            const token =
                result?.data?.token;

            const employee =
                result?.data?.employee;


            // ----------------------------------------------------
            // Validate response
            // ----------------------------------------------------

            if (!token) {

                throw new Error(
                    "Login succeeded but the server did not return an authentication token."
                );

            }


            if (!employee) {

                throw new Error(
                    "Login succeeded but the server did not return employee information."
                );

            }


            // ----------------------------------------------------
            // Make sure backend role matches selected role
            // ----------------------------------------------------

            if (employee.role !== role) {

                throw new Error(
                    "You do not have permission to access this portal."
                );

            }


            // ====================================================
            // STORE AUTHENTICATION
            // ====================================================
            //
            // IMPORTANT:
            //
            // worker_api.js uses "token"
            // script.js uses "employee"
            //
            // We store those exact keys.
            //
            // We also keep authToken/loggedInUser for compatibility
            // with any existing HR/frontend code.
            // ====================================================

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "authToken",
                token
            );

            localStorage.setItem(
                "employee",
                JSON.stringify(employee)
            );

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(employee)
            );

            localStorage.setItem(
                "userRole",
                employee.role
            );


            // ----------------------------------------------------
            // Store worker profile
            // ----------------------------------------------------

            if (employee.role === "worker") {

                localStorage.setItem(
                    "workerProfile",
                    JSON.stringify(employee)
                );

            }


            // ----------------------------------------------------
            // Log authentication information
            // ----------------------------------------------------

            console.log(
                "Authentication successful."
            );

            console.log(
                "Authenticated employee:",
                employee
            );

            console.log(
                "Role:",
                employee.role
            );


            // ----------------------------------------------------
            // Success message
            // ----------------------------------------------------

            showMessage(
                "Login successful! Redirecting...",
                "success"
            );


            // ----------------------------------------------------
            // Redirect based on DATABASE role
            // ----------------------------------------------------

            setTimeout(() => {

                if (employee.role === "hr") {

                    window.location.href =
                        "hr-dashboard.html";

                } else if (
                    employee.role === "worker"
                ) {

                    window.location.href =
                        "worker-dashboard.html";

                } else {

                    showMessage(
                        "Your account does not have a valid portal role.",
                        "error"
                    );

                }

            }, 500);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to connect to the server.",
                "error"
            );


        } finally {

            loginButton.disabled = false;

            loginButton.innerHTML =
                originalButtonText;

        }

    });


    // ============================================================
    // MESSAGE DISPLAY
    // ============================================================

    function showMessage(message, type) {

        let messageBox =
            document.querySelector(
                ".login-message"
            );


        if (!messageBox) {

            messageBox =
                document.createElement("div");

            messageBox.className =
                "login-message";

            loginForm.prepend(
                messageBox
            );

        }


        messageBox.textContent =
            message;

        messageBox.className =
            `login-message ${type}`;

    }

});
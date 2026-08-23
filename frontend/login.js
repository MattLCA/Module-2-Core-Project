// ============================================================
// ModernTech Login
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm =
        document.getElementById("loginForm");

    const passwordInput =
        document.getElementById("password");

    const identifierInput =
        document.getElementById("loginIdentifier");

    const identifierLabel =
        document.getElementById("loginIdentifierLabel");

    const identifierIcon =
        document.getElementById("loginIdentifierIcon");

    const roleInputs =
        document.querySelectorAll(
            'input[name="role"]'
        );

    const forgotPasswordLink =
        document.getElementById(
            "forgotPasswordLink"
        );


    if (!loginForm) {
        console.error("Login form not found.");
        return;
    }


    // ========================================================
    // CHANGE IDENTIFIER WHEN ROLE CHANGES
    // ========================================================

    roleInputs.forEach(roleInput => {

        roleInput.addEventListener(
            "change",
            () => {

                if (
                    roleInput.value === "Employee" &&
                    roleInput.checked
                ) {

                    if (identifierLabel) {
                        identifierLabel.textContent =
                            "Employee ID";
                    }

                    if (identifierInput) {
                        identifierInput.type =
                            "text";

                        identifierInput.placeholder =
                            "Enter your employee ID";

                        identifierInput.value = "";
                    }

                    if (identifierIcon) {
                        identifierIcon.className =
                            "ti ti-id";
                    }

                } else {

                    if (identifierLabel) {
                        identifierLabel.textContent =
                            "Email Address";
                    }

                    if (identifierInput) {
                        identifierInput.type =
                            "email";

                        identifierInput.placeholder =
                            "Enter your email address";

                        identifierInput.value = "";
                    }

                    if (identifierIcon) {
                        identifierIcon.className =
                            "ti ti-mail";
                    }

                }

            }
        );

    });


    // ========================================================
    // LOGIN
    // ========================================================

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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


            const role =
                selectedRole === "HR Manager"
                    ? "hr"
                    : "worker";


            const identifier =
                identifierInput?.value.trim() || "";

            const password =
                passwordInput?.value || "";


            if (!identifier || !password) {

                showMessage(
                    "Please enter your login details.",
                    "error"
                );

                return;
            }


            const loginButton =
                loginForm.querySelector(
                    ".login-btn"
                );


            const originalButtonText =
                loginButton
                    ? loginButton.innerHTML
                    : "";


            if (loginButton) {
                loginButton.disabled = true;

                loginButton.innerHTML = `
                    <span>Signing in...</span>
                    <i class="ti ti-loader-2"></i>
                `;
            }


            try {

                // ------------------------------------------------
                // DO NOT CLEAR THE OTHER PORTAL'S SESSION
                // ------------------------------------------------
                //
                // HR and worker sessions are deliberately kept
                // separate so that logging into one portal does
                // not overwrite the other portal.
                //
                // ------------------------------------------------


                const response =
                    await fetch(
                        "http://localhost:4000/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                role,
                                identifier,
                                password
                            })
                        }
                    );


                const result =
                    await response
                        .json()
                        .catch(() => ({}));


                console.log(
                    "Login response:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        result.message ||
                        "Login failed. Please check your details."
                    );
                }


                const token =
                    result?.data?.token;

                const employee =
                    result?.data?.employee;


                if (!token) {

                    throw new Error(
                        "Login succeeded but no authentication token was returned."
                    );
                }


                if (!employee) {

                    throw new Error(
                        "Login succeeded but no employee information was returned."
                    );
                }


                if (
                    employee.role !== role
                ) {

                    throw new Error(
                        "You do not have permission to access this portal."
                    );
                }


                // ==================================================
                // HR SESSION
                // ==================================================

                if (role === "hr") {

                    localStorage.setItem(
                        "hrToken",
                        token
                    );

                    localStorage.setItem(
                        "hrEmployee",
                        JSON.stringify(employee)
                    );

                    localStorage.setItem(
                        "hrRole",
                        "hr"
                    );

                }


                // ==================================================
                // WORKER SESSION
                // ==================================================

                if (role === "worker") {

                    localStorage.setItem(
                        "workerToken",
                        token
                    );

                    localStorage.setItem(
                        "workerEmployee",
                        JSON.stringify(employee)
                    );

                    localStorage.setItem(
                        "workerRole",
                        "worker"
                    );

                    localStorage.setItem(
                        "workerProfile",
                        JSON.stringify(employee)
                    );

                }


                showMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                setTimeout(() => {

                    if (role === "hr") {

                        window.location.href =
                            "hr-dashboard.html";

                    } else {

                        window.location.href =
                            "worker-dashboard.html";

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

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML =
                        originalButtonText;

                }

            }

        }
    );


    // ========================================================
    // FORGOT PASSWORD
    // ========================================================

    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showMessage(
                    "Please contact HR to reset your password.",
                    "error"
                );

            }
        );

    }


    // ========================================================
    // MESSAGE DISPLAY
    // ========================================================

    function showMessage(
        message,
        type
    ) {

        let messageBox =
            document.querySelector(
                ".login-message"
            );


        if (!messageBox) {

            messageBox =
                document.createElement(
                    "div"
                );

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
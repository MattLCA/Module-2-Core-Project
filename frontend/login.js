document.addEventListener("DOMContentLoaded", () => {


    const loginForm = document.querySelector("form");

    const passwordInput = document.querySelector(
        'input[type="password"]'
    );

    const identifierInput = document.getElementById("loginIdentifier");

    const identifierLabel = document.getElementById("loginIdentifierLabel");

    const identifierIcon = document.getElementById("loginIdentifierIcon");

    const roleInputs = document.querySelectorAll('input[name="role"]');


    roleInputs.forEach(role => {

        role.addEventListener("change", () => {

            if(role.value === "Employee" && role.checked){

                identifierLabel.textContent = "Employee ID";

                identifierInput.type = "text";

                identifierInput.placeholder = "EMP001";

                identifierIcon.className = "ti ti-id";

            }

            else{

                identifierLabel.textContent = "Email Address";

                identifierInput.type = "email";

                identifierInput.placeholder = "jordan@moderntech.com";

                identifierIcon.className = "ti ti-mail";

            }

        });

    });



    loginForm.addEventListener("submit", async (e)=>{


        e.preventDefault();



        const selectedRole =
        document.querySelector('input[name="role"]:checked').value;

        const identifier = identifierInput.value.trim();

        const password = passwordInput.value.trim();

        // Frontend uses "HR Manager"/"Employee" labels, backend expects "hr"/"worker"
        const apiRole = selectedRole === "HR Manager" ? "hr" : "worker";

        try {

            const result = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    role: apiRole,
                    identifier: identifier,
                    password: password
                })
            });

            const { token, employee } = result.data;

            // Save token and employee info
            localStorage.setItem("authToken", token);
            localStorage.setItem("loggedInUser", JSON.stringify(employee));

            showMessage(
                "Login successful! Redirecting...",
                "success"
            );

            setTimeout(()=>{

                if(employee.role === "hr"){

                    window.location.href = "hr-dashboard.html";

                }

                else if(employee.role === "worker"){

                    window.location.href = "worker-dashboard.html";

                }

            },1000);

        }

        catch (err) {

            showMessage(
                "Incorrect Employee ID/Email or password.",
                "error"
            );

        }


    });





    function showMessage(message,type){


        let messageBox =
        document.querySelector(".login-message");



        if(!messageBox){

            messageBox =
            document.createElement("div");

            messageBox.className =
            "login-message";


            loginForm.prepend(messageBox);

        }



        messageBox.textContent = message;


        messageBox.className =
        `login-message ${type}`;


    }



});
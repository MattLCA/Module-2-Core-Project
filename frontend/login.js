document.addEventListener("DOMContentLoaded", () => {


    const loginForm = document.querySelector("form");

    const passwordInput = document.querySelector(
        'input[type="password"]'
    );

    const identifierInput = document.getElementById("loginIdentifier");

    const identifierLabel = document.getElementById("loginIdentifierLabel");

    const identifierIcon = document.getElementById("loginIdentifierIcon");

    const roleInputs = document.querySelectorAll('input[name="role"]');


    // Demo HR users
    const users = [

        {
            email: "busiswa@moderntech.com",
            password: "admin123",
            role: "HR Manager",
            name: "Busiswa Bala"
        },

        {
            employeeId: "EMP001",
            password: "employee123",
            role: "Employee",
            name: "Sarah Williams"
        },

        {
            employeeId: "EMP002",
            password: "employee456",
            role: "Employee",
            name: "John Smith"
        }

    ];

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



    loginForm.addEventListener("submit", (e)=>{


        e.preventDefault();



        const selectedRole =
        document.querySelector('input[name="role"]:checked').value;

        const identifier = identifierInput.value.trim();

        const password = passwordInput.value.trim();

        let user;

        if(selectedRole === "HR Manager"){

            user = users.find(account =>

                account.email === identifier &&
                account.password === password &&
                account.role === "HR Manager"

            );

        }

        else{

            user = users.find(account =>

                account.employeeId === identifier &&
                account.password === password &&
                account.role === "Employee"

            );

        }



        if(user){


            // Save logged-in user

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(user)
            );


            showMessage(
                "Login successful! Redirecting...",
                "success"
            );


            setTimeout(()=>{


                if(user.role === "HR Manager"){

                    window.location.href = "hr-dashboard.html";

                }


                else if(user.role === "Employee"){

                    window.location.href = "worker-dashboard.html";

                }


            },1000);



        }

        else{


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
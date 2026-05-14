document.addEventListener("DOMContentLoaded", () => { // sets up a event listener 
    const form = document.querySelector(".sign_up_Inputs"); // selects query from form via a form ID

    // user interafce variables
    const divForm = document.querySelector("#divForm");
    const divLoading = document.querySelector("#divLoading");
    const divSuccess = document.querySelector("#divSuccess");
    const backBtn = document.querySelector("#backBtn");

    if (!form) { // if statment for if form not found
        console.error("Signup form not found.");
        return;
    }

    form.addEventListener("submit", async (event) => { // form event listener if a submit event action is done in this case a button click
        event.preventDefault();

        // Get form values
        const first_name = document.querySelector("#fname")?.value.trim();
        const last_name = document.querySelector("#lname")?.value.trim();
        const date_of_birth = document.querySelector("#dob")?.value;
        const gender = document.querySelector("#gender")?.value.trim();
        const degree_type = document.querySelector("#degree_type")?.value.trim();
        const subject = document.querySelector("#subject")?.value.trim();
        const year_of_study_currunt = Number(document.querySelector("#studyYear")?.value);
        const email = document.querySelector("#email")?.value.trim().toLowerCase();
        const phone_num = document.querySelector("#phone")?.value.trim();
        const description = document.querySelector("#description")?.value.trim();
        const password = document.querySelector("#password")?.value;

        // Basic client-side validation 
        if (
            !first_name ||
            !last_name ||
            !date_of_birth ||
            !gender ||
            !subject ||
            !degree_type ||
            !email ||
            !description ||
            !password
        ) {
            alert("Please fill in all required fields."); // alert iof fields arent entered
            return;
        }
        if (!Number.isInteger(year_of_study_currunt) || year_of_study_currunt < 1) {
            alert("Please enter a valid year of study.");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        // sets up const of user data
        const userData = {
            first_name,
            last_name,
            date_of_birth,
            gender,
            subject,
            degree_type,
            year_of_study_currunt,
            email,
            phone_num,
            description,
            password
        };

        // start loading gif 
        if (divForm) divForm.style.display = 'none';
        if (divLoading) divLoading.style.display = 'block';

        try { // utilises a fetch request from server.js 
            const response = await fetch("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData) // converts data to a JSON string
            });

            const result = await response.json();

            if (!response.ok) { //error if statement 
                throw new Error(result.error || "Failed to create user.");
            }
            
            // only happens if the server response is OK
            if (divLoading) divLoading.style.display = 'none';
            if (divSuccess) divSuccess.style.display = 'block';

            form.reset(); // resets form

            // a time delay for loading gif
            setTimeout(() => {
                window.location.href = "/verify-notice.html"; // takes to user to verification page
            }, 1600);

            console.log(result); //logs to console UI
            
        } catch (error) { // error catch
            console.error("Signup failed:", error);

            // errors reset for loading gif
            // If the server fails, brings the form back so user can see the alert
            if (divLoading) divLoading.style.display = 'none';
            if (divForm) divForm.style.display = 'block';

            alert(error.message);
        }
    });

    backBtn.addEventListener("click", () => { // code for backbutton
        window.location.href = "index.html";
    });
});
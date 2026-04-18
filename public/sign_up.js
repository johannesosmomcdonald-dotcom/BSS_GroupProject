document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".sign_up_Inputs");

    if (!form) {
        console.error("Signup form not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {
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
            alert("Please fill in all required fields.");
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

        try {
            const response = await fetch("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create user.");
            }
            
            alert("Account created successfully. You can now log in.");
            console.log(result);
            form.reset();
            window.location.href = "/login.html";
        } catch (error) {
            console.error("Signup failed:", error);
            alert(error.message);
        }
    });
});
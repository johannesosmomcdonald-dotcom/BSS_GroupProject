document.addEventListener("DOMContentLoaded", () => {
     // loading gif variables and back button variable
    const divForm = document.querySelector("#divForm");
    const divLoading = document.querySelector("#divLoading");
    const divSuccess = document.querySelector("#divSuccess");
    const loadingText = document.querySelector("#loadingText");
    const successText = document.querySelector("#successText");
    const backBtn = document.querySelector("#backBtn"); 

    // these functions handle the feedback system by switching between loading, 
    // success, and the form views
    const showLoading = (text) => {
        divForm.style.display = "none";
        divSuccess.style.display = "none";
        divLoading.style.display = "block";
        loadingText.textContent = text;
    };

    const showSuccess = (text) => {
        divLoading.style.display = "none";
        divSuccess.style.display = "block";
        successText.textContent = text;
    };

    const resetUI = () => {
        divLoading.style.display = "none";
        divSuccess.style.display = "none";
        divForm.style.display = "block";
    };

    // tells the server to send an email
    document.querySelector("#sendCodeBtn").addEventListener("click", async () => {
        const email = document.querySelector("#resetEmail").value;
        if (!email) return console.log("Please enter email");

        showLoading("Sending verification code...");

        try { // fetch API call to the backend server.js
            const response = await fetch("/request-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                resetUI();
                // allows transition to display objects through the verification steps
                document.querySelector("#step1").style.display = "none";
                document.querySelector("#step2").style.display = "block";
            } else {
                console.log("Error sending code.");
                resetUI();
            }
        } catch (error) {
            console.log("Connection error.");
            resetUI();
        }
    });

    // tells the server to update the password
    document.querySelector("#finishResetBtn").addEventListener("click", async () => {
        const email = document.querySelector("#resetEmail").value;
        const code = document.querySelector("#verifyCode").value;
        const newPass = document.querySelector("#newPass").value;

        // a validation input for the reset code
        if (code.length !== 6) return console.log("Please enter the 6-digit code.");

        showLoading("Updating password...");

        try {
            const response = await fetch("/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPass })
            });

            if (response.ok) {
                showSuccess("Password updated successfully!");
                // delays redirection to allow the user to see the success state
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else { // if the server.js returns an error, hide the loading gif and try again
                const result = await response.json();
                console.log(result.error || "Reset failed.");
                resetUI();
            }
        } catch (error) {
            console.error("Fetch error:", error);
            console.log("Connection error.");
            resetUI();
        }
    });

    backBtn.addEventListener("click", () => { // code for backbutton
    window.location.href = "login.html";
  });
});

// Tom or Johan - DELETE THIS AFTER YOU HAVE IMPLEMENTED THIS.

/*
I've created the html and this js code for the forgot password. 
however you need to: create POST for:

app.post("/request-reset"): This should take the student to their email, generate a random code (maybe using the crypto logic we used for signup), and use our transporter to email it to the user.

And POST: app.post("/reset-password"): This needs to check if the code matches what's in the database and then update the user's password using bcrypt.

I've used fetch in my js to point to these exact urls, so once their both live, the whole thing should connect automatically. hopefully.  
*/
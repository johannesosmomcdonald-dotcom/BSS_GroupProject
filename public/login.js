document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#login_Inputs"); // code for selecting specific queries in login.html form
  const message = document.querySelector("#message");

  form.addEventListener("submit", async (event) => { // event listener aka button click 
    event.preventDefault();

    const email = document.querySelector("#email").value.trim().toLowerCase(); // getting values and assigning const to them
    const password = document.querySelector("#password").value;

    message.textContent = "";

    try { // inputting login 
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard.html"; // moving to dahsboard if succesful 
    } catch (error) {
      message.textContent = error.message;
      console.error("Login error:", error);
    }
  });

  backBtn.addEventListener("click", () => { // code for backbutton
    window.location.href = "/index.html";
  });

});
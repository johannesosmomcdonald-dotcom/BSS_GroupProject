document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#login_Inputs"); // code for selecting specific queries in login.html form
  const message = document.querySelector("#message");
<<<<<<< HEAD
=======
  const backBtn = document.querySelector("#backBtn"); // code for backbutton

  // loading gif variables
  const divForm = document.querySelector("#divForm");
  const divLoading = document.querySelector("#divLoading");
  const divSuccess = document.querySelector("#divSuccess");
>>>>>>> 143a869 (merging a mix of Hannahs and Toms work)

  form.addEventListener("submit", async (event) => { // event listener aka button click 
    event.preventDefault();

    const email = document.querySelector("#email").value.trim().toLowerCase(); // getting values and assigning const to them
    const password = document.querySelector("#password").value;

    message.textContent = "";

<<<<<<< HEAD
=======
    // start loading gif
    if (divForm) divForm.style.display = 'none';
    if (divLoading) divLoading.style.display = 'block';

>>>>>>> 143a869 (merging a mix of Hannahs and Toms work)
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

<<<<<<< HEAD
      window.location.href = "/dashboard.html"; // moving to dahsboard if succesful 
    } catch (error) {
=======
      // successful loading gif
      if (divLoading) divLoading.style.display = 'none';
      if (divSuccess) divSuccess.style.display = 'block';

      // small delay for the loading gif
      setTimeout(() => {
        window.location.href = "dashboard.html"; // moving to dahsboard if successful 
      }, 1400);

    } catch (error) {
      // reset on error
      if (divLoading) divLoading.style.display = 'none';
      if (divForm) divForm.style.display = 'block';

>>>>>>> 143a869 (merging a mix of Hannahs and Toms work)
      message.textContent = error.message;
      console.error("Login error:", error);
    }
  });

  backBtn.addEventListener("click", () => { // code for backbutton
<<<<<<< HEAD
    window.location.href = "/index.html";
=======
    window.location.href = "index.html";
>>>>>>> 143a869 (merging a mix of Hannahs and Toms work)
  });

});
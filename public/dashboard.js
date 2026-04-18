document.addEventListener("DOMContentLoaded", () => {
    // fetching from html dashboard
  const welcomeText = document.querySelector("#welcomeText");
  const profileList = document.querySelector("#profileList");
  const logoutBtn = document.querySelector("#logoutBtn");
  const message = document.querySelector("#message");

  async function loadDashboard() {
    try {
      const response = await fetch("/api/dashboard"); // waiting for server 
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load dashboard"); // error check
      }

      const user = result.user;

      welcomeText.textContent = `Welcome, ${user.first_name} ${user.last_name}`; // printing unique user id data

      profileList.innerHTML = `
        <li><strong>User ID:</strong> ${user.id}</li>
        <li><strong>First name:</strong> ${user.first_name}</li>
        <li><strong>Last name:</strong> ${user.last_name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Date of birth:</strong> ${user.date_of_birth || "Not provided"}</li>
        <li><strong>Gender:</strong> ${user.gender || "Not provided"}</li>
        <li><strong>Subject:</strong> ${user.subject}</li>
        <li><strong>Degree type:</strong> ${user.degree_type}</li>
        <li><strong>Year of study:</strong> ${user.year_of_study_currunt}</li>
        <li><strong>Phone number:</strong> ${user.phone_num || "Not provided"}</li>
        <li><strong>Description:</strong> ${user.description}</li>
      `;
    } catch (error) {
      console.error("Dashboard error:", error);
      welcomeText.textContent = "You are not logged in.";
      profileList.innerHTML = "";
      message.textContent = error.message; // catch to make sure youre logged in

      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1200);
    }
  }

  logoutBtn.addEventListener("click", async () => { // logout feature
    try {
      const response = await fetch("/logout", {
        method: "POST"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Logout failed");
      }

      window.location.href = "/login.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });

  loadDashboard(); // calling function
});
document.addEventListener("DOMContentLoaded", () => { //same as other  JS files in /public
  // fetching from html dashboard
  //const welcomeText = document.querySelector("#welcomeText"); don't need anymore
  const profileList = document.querySelector("#profileList");
  //const editDetailsBtn = document.querySelector("#editDetailsBtn"); don't need anymore
  const logoutBtn = document.querySelector("#logoutBtn");
  const message = document.querySelector("#message");
  const userSearchForm = document.querySelector("#userSearchForm");
  const degreeSearch = document.querySelector("#degreeSearch");
  const searchResults = document.querySelector("#searchResults");
  const searchMessage = document.querySelector("#searchMessage");

  async function loadDashboard() {
    try {
      const response = await fetch("/api/dashboard"); // waiting for server 
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load dashboard"); // error check
      }

      const user = result.user;

      welcomeText.textContent = `Welcome, ${user.first_name} ${user.last_name}`; // printing unique user id data
      // creating list of user info displayed via innerHTML

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


  editDetailsBtn.addEventListener("click", () => { // edit button takes back to profile
    window.location.href = "/profile.html";
  });


  logoutBtn.addEventListener("click", async () => { // logout feature
    try {
      const response = await fetch("/logout", {
        method: "POST"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Logout failed");
      }

      window.location.href = "/index.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });

  // added the ability to view profile of an expert
  function displaySearchResults(users) { // takes the database as a paramater
    if (!users.length) {
      searchResults.innerHTML = "";
      searchMessage.textContent = "No users found for that degree.";
      return; // returns message if no users found in database for that degree
    }

    searchMessage.textContent = `${users.length} user(s) found`; // message sent through if users found

    // uses map to go through each user, sets up an article for each user with their data info
    searchResults.innerHTML = users.map(user => ` 
    <article class="user-card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <h3>${user.first_name} ${user.last_name}</h3>
      <p><strong>Subject:</strong> ${user.subject}</p>
      <p><strong>Degree type:</strong> ${user.degree_type}</p>
      <p><strong>Year of study:</strong> ${user.year_of_study_currunt}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone_num || "Not provided"}</p>
      <p><strong>Description:</strong> ${user.description || "No description"}</p>

    <a href="expert-profile.html?id=${user.id}" class="cta-btn" style="display: inline-block; text-decoration: none; margin-top: 10px; padding: 8px 20px; width: auto;">
        View Profile & Contact
      </a>
  </article>

  `).join(""); // joins them all together
  }

  userSearchForm.addEventListener("submit", async (event) => { // event listener for when button clicked hence async 
    event.preventDefault(); // tells event that it is being expicetly handled hence no need to do default action of type input

    try {
      searchMessage.textContent = "Searching...";
      searchResults.innerHTML = ""; // updating messages on displayed

      const degree = degreeSearch.value.trim(); // creating degree var used in Server JS built previously
      const response = await fetch(`/api/users/search?degree=${encodeURIComponent(degree)}`); // standard fetch request
      const result = await response.json(); // var for the result of a search

      if (!response.ok) { // if response is unsuccesful return a failed search message
        throw new Error(result.error || "Search failed");
      }

      displaySearchResults(result.users); // if response is good display users
    } catch (error) {
      searchMessage.textContent = error.message; // catch for erros to display for user sake
    }
  });

  loadDashboard(); // calling function



  

  // allows a user to be able to logout from dashboard
  const logoutBtn = document.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          // if successful, redirects the user to the main page
          window.location.href = "index.html";
        } else {
          alert("Logout failed. Please try again.");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }
});


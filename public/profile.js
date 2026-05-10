// code for unique profiles
document.addEventListener("DOMContentLoaded", () => { 
  const form = document.querySelector("#profileForm");
  const statusMessage = document.querySelector("#statusMessage");
  const backBtn = document.querySelector("#backBtn");

  // loading gif
  const divForm = document.querySelector("#divForm"); 
  const divLoading = document.querySelector("#divLoading"); 
  const divSuccess = document.querySelector("#divSuccess"); 

  async function loadProfile() { 
    try {
      const response = await fetch("/api/dashboard"); // fetch dashboard
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load profile"); // basic profile check
      }

      const user = result.user; // user = user

      document.querySelector("#first_name").value = user.first_name || ""; // loads user values
      document.querySelector("#last_name").value = user.last_name || "";
      document.querySelector("#date_of_birth").value = user.date_of_birth
        ? String(user.date_of_birth).split("T")[0]
        : "";
      document.querySelector("#gender").value = user.gender || "";
      document.querySelector("#subject").value = user.subject || "";
      document.querySelector("#degree_type").value = user.degree_type || "";
      document.querySelector("#year_of_study_currunt").value = user.year_of_study_currunt || "";
      document.querySelector("#email").value = user.email || "";
      document.querySelector("#phone_num").value = user.phone_num || "";
      document.querySelector("#description").value = user.description || "";
    } catch (error) {
      console.error("Profile load error:", error); // time error check
      statusMessage.textContent = error.message;
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1200);
    }
  }

  form.addEventListener("submit", async (event) => { // form event listner for updating user details
    event.preventDefault();

    // start loading gif
    if (divForm) divForm.style.display = 'none'; 
    if (divLoading) divLoading.style.display = 'block'; 
    

    const userData = {
      first_name: document.querySelector("#first_name").value.trim(),
      last_name: document.querySelector("#last_name").value.trim(),
      date_of_birth: document.querySelector("#date_of_birth").value || null,
      gender: document.querySelector("#gender").value.trim(),
      subject: document.querySelector("#subject").value.trim(),
      degree_type: document.querySelector("#degree_type").value.trim(),
      year_of_study_currunt: Number(document.querySelector("#year_of_study_currunt").value),
      email: document.querySelector("#email").value.trim().toLowerCase(),
      phone_num: document.querySelector("#phone_num").value.trim(),
      description: document.querySelector("#description").value.trim()
    };

    try { // 
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update details");

      }

    // allows a user interface to succeed
      if (divLoading) divLoading.style.display = 'none'; 
      if (divSuccess) divSuccess.style.display = 'block';

      if (statusMessage) statusMessage.textContent = "Details updated successfully."; 

    } catch (error) {
      console.error("Profile update error:", error);
      
      // reset brings user back to the profile
      if (divLoading) divLoading.style.display = 'none';
      if (divForm) divForm.style.display = 'block';

      if (statusMessage) statusMessage.textContent = error.message; // added this 
      alert(error.message); 
    }
  });

  backBtn.addEventListener("click", () => { // code for backbutton
    window.location.href = "dashboard.html"; 
  });

  loadProfile();
});
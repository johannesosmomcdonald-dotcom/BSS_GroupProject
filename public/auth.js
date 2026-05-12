document.addEventListener("DOMContentLoaded", async () => {
    const dropdownContent = document.querySelector(".dropdown-content");
    
    try {
        // fetch from the existing dashboard API to check for a login register
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        // if the response is successful and contains user data, the user is logged in
        if (response.ok && result.user) {
            dropdownContent.innerHTML = `
                <div class="dropdown-arrow"></div>
                <a href="dashboard.html">Dashboard</a>
                <a href="profile.html">My Profile</a>
                <a href="about.html">About Us</a>
                <a href="contact.html">Contact Us</a>
                <button id="logoutBtn" class="cta-btn">Log out</button>
            `;

            // attachs the logout listener to the newly created logout button
            setupLogout();

            // updates index.html main cta
            // changes the GET STARTED button to DASHBOARD
            const mainCta = document.querySelector(".step .cta-btn");
            if (mainCta) {
                mainCta.textContent = "Go to Dashboard";
                mainCta.setAttribute("onclick", "window.location.href='dashboard.html'");
            }
        }
    } catch (error) {
        // if not logged in, the default (Login) links in the html with remain
        console.log("No active session detected.");
    }
});

function setupLogout() {
    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const res = await fetch("/logout", { method: "POST" });
            if (res.ok) window.location.href = "index.html";
        });
    }
}

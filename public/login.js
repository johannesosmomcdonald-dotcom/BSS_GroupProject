document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#login_Inputs");
  const message = document.querySelector("#message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value;

    message.textContent = "";

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "app/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      window.location.href = "/dashboard.html";
    } catch (error) {
      message.textContent = error.message;
      console.error("Login error:", error);
    }
  });
});
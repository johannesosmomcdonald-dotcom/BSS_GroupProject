// code for cookie banner interactivity

document.addEventListener("DOMContentLoaded", () => { 
  const cookieBanner = document.querySelector("#cookieBanner");
  const acceptBtn = document.querySelector(".accept");
  const declineBtn = document.querySelector(".decline");

  // function to hide the banner and save preference
  function handleCookieChoice(choice) {
    try {
      cookieBanner.style.opacity = "0"; // fades out first
      setTimeout(() => {
        cookieBanner.style.display = "none";
      }, 500); // wait for fade animation to finish
      
      localStorage.setItem("step_cookies_accepted", choice); 
    } catch (error) {
      console.error("Cookie error:", error);
    }
  }

  // check if user already has a choice saved
  const savedChoice = localStorage.getItem("step_cookies_accepted");

  if (!savedChoice) {
    // if no choice, show the banner with a slight delay
    setTimeout(() => {
      cookieBanner.style.display = "block";
      // small timeout to allow the (display = "block") to register before changing opacity
      setTimeout(() => {
        cookieBanner.style.opacity = "1";
      }, 50);
    }, 800); // 800ms delay so it appears after the page loads
  }

  // event listeners
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      handleCookieChoice("all");
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      handleCookieChoice("necessary");
    });
  }
});
// scroll to top 

document.addEventListener("DOMContentLoaded", () => {
  const topBtn = document.querySelector("#goToTopBtn");

  if (!topBtn) return; // safety check

  const toggleVisible = () => {
    try {
      // shows after 300px of scrolling
      if (window.scrollY > 300 || document.documentElement.scrollTop > 300) {
        topBtn.style.display = "flex";
      } else {
        topBtn.style.display = "none";
      }
    } catch (e) {
      console.error("Scroll visibility error:", e);
    }
  };

  // listen for scroll events
  window.addEventListener("scroll", toggleVisible);

  // smooth scroll to top on click
  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector("#contactForm");
    const divForm = document.querySelector("#divForm");
    const divLoading = document.querySelector("#divLoading");
    const divSuccess = document.querySelector("#divSuccess");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
         // hides the form area and show the loading gif

        if (divForm) divForm.style.display = "none";
        if (divLoading) divLoading.style.display = "block";

        try {
             // sees the animation before the success message
            await new Promise(resolve => setTimeout(resolve, 1600));

            const formData = new FormData(contactForm);

            const response = await fetch("/api/contact-support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.get("email"),
                    reason: formData.get("category"),
                    summary: formData.get("subject"),
                    description: formData.get("message"),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send message");
            }
             // hide the loading gif and then shows teh thank message

            if (divLoading) divLoading.style.display = "none";
            if (divSuccess) divSuccess.style.display = "block";

            contactForm.reset();
        } catch (error) {
            console.error("Submission error:", error);
            // If it fails, bring the form back

            if (divLoading) divLoading.style.display = "none";
            if (divForm) divForm.style.display = "block";

            alert("Something went wrong. Please try again.");
        }
    });
});
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('id'); // grabs the id from the url

  const nameHeader = document.querySelector("#expertName");
  const tagline = document.querySelector("#expertTagline");
  const subjectSpan = document.querySelector("#displaySubject");
  const degreeSpan = document.querySelector("#displayDegree");
  const yearSpan = document.querySelector("#displayYear");
  const descPara = document.querySelector("#displayDescription");

  // loading gif
  const contactForm = document.querySelector("#contactForm");
  const divForm = document.querySelector("#divForm");
  const divLoading = document.querySelector("#divLoading");
  const divSuccess = document.querySelector("#divSuccess");

  if (!expertId) {
    nameHeader.textContent = "Error";
    tagline.textContent = "No expert ID provided.";
    return;
  }

  try {
    // endpoint that fetches a single user by ID
    const response = await fetch(`/api/users/${expertId}`);
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to load profile");

    const expert = result.user;

    // fills the page with the info from the database
    nameHeader.textContent = `${expert.first_name} ${expert.last_name}`;
    tagline.textContent = `${expert.subject} Expert`;
    subjectSpan.textContent = expert.subject;
    degreeSpan.textContent = expert.degree_type;
    yearSpan.textContent = expert.year_of_study_currunt;
    descPara.textContent = expert.description || "This expert hasn't written a bio yet.";

    // addiitonal details about the expert
    document.querySelector("#displayEmail").textContent = expert.email;
    document.querySelector("#displayPhone").textContent = expert.phone_num || "Not provided";
    document.querySelector("#displayGender").textContent = expert.gender || "Not provided";
    document.querySelector("#displayDOB").textContent = expert.date_of_birth || "Not provided";

  } catch (error) {
    console.error("Profile load error:", error);
    tagline.textContent = "Could not find this expert's details.";
  }

  // message form submission
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const messageText = document.querySelector("#userMessage").value;

      // hides the form area and shows the loading gif
      if (divForm) divForm.style.display = 'none';
      if (divLoading) divLoading.style.display = 'block';

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: expertId,
            message: messageText
          })
        });

        // delay to show off the loading gif 
        await new Promise(resolve => setTimeout(resolve, 1600));

        if (res.ok) {
          // hide loading and show success message
          if (divLoading) divLoading.style.display = 'none';
          if (divSuccess) divSuccess.style.display = 'block';
          contactForm.reset();
        } else {
          throw new Error("Failed to send message.");
        }
      } catch (err) {
        console.error("Submission error:", err);
        // If it fails, bring the form back so user can try again
        if (divLoading) divLoading.style.display = 'none';
        if (divForm) divForm.style.display = 'block';
        alert("Something went wrong. Please try again.");
      }
    });
  }
});

// Johan delete these comments after you added in the get and post api for the server.js code
/* To make the expert profile and messaging work, please add these two routes
  to your server.js file.

  you have to create a new table called messages that look like this:
  id (serial) (PRIMARY KEY), sender_id (int), recipient_id (int), message_text (text), created_at (timestamp).

  like this:
  CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,    -- who sent it
    recipient_id INTEGER NOT NULL, -- who receives it
    message_text TEXT NOT NULL,    -- the actual message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

// btw the message will only have the look like it was sent, but not actually.

/*
// GET: Fetches the expert details for their profile page
app.get("/api/users/:id", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, date_of_birth, gender, subject,
              degree_type, year_of_study_currunt, email, phone_num, description
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

//POST: Saves a new message to the database
app.post("/api/messages", requireLogin, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, message_text) VALUES ($1, $2, $3)',
      [req.session.userId, recipientId, message]
    );
    res.json({ message: "Message sent!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
*/

// make sure to double check the users table actually contains description, gender and date_of_birth columns

// if it needs tweaking, please just to fix it, i spent quite a while doing this.
//////////////////////////////////////////////////////////////////////////////////////////
// Code for connecting neon, render and github

const express = require("express");
const  path  = require("path");
const { Pool } = require("pg");
require("dotenv").config();
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

const port = process.env.PORT || 3000; //Port



// PostgreSQL / Neon connection with SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

// Test DB connection
pool.connect()
  .catch(err => console.error("Database connection error:", err));
// Root endpoint

/////////////////////////// ALL GETS are below this comment

// Gets all users in database
app.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users;"); //Query for database
    res.json(rows); //prints results of JSON
  } catch (error) { // no valid status found
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: error.message });
  }
});


// Gets index page
app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

/////////////////////////////// ALL POSTS are below this comment
//post for adding new users to the database
application.post("/users", async (req, res) => {
  try {
    const first_name = String(req.body.first_name || "").trim();
    const last_name = String(req.body.last_name || "").trim();
    const Date_Of_Birth = req.body.Date_Of_Birth;
    const gender = String(req.body.gender || "").trim();
    const subject = String(req.body.subject || "").trim();
    const degree_type = String(req.body.degree_type || "").trim();
    const year_of_study_currunt = Number(req.body.year_of_study_currunt);
    const email = String(req.body.email || "").trim().toLowerCase();
    const phoneNum = String(req.body.phoneNum || "").trim();
    const description = String(req.body.description || "").trim();
    const password = String(req.body.password || "");

    if (!first_name || !last_name || !subject || !degree_type || !email || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!Number.isInteger(year_of_study_currunt) || year_of_study_currunt < 1) {
      return res.status(400).json({ error: "Invalid year_of_study_currunt" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (description.length > 1000) {
      return res.status(400).json({ error: "Description too long" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    //query uses placeholders to prevent SQL injection 
    // returned statement has no hash

    const result = await pool.query(
      `INSERT INTO users
        (first_name, last_name, Date_Of_Birth, gender, subject, degree_type, year_of_study_currunt, email, phoneNum, description, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, first_name, last_name, Date_Of_Birth, gender, subject, degree_type, year_of_study_currunt, email, phoneNum, description;`,
      [
        first_name,
        last_name,
        Date_Of_Birth,
        gender,
        subject,
        degree_type,
        year_of_study_currunt,
        email,
        phoneNum,
        description,
        password_hash,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    // err.code = "23505" is used to catch duplicate emails to prevent malicous users from creating duplicate accounts breaking the system
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});





///////////////////////////////// ALL Listens are below this comment
//loads local server 
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


///////////////////////////////////////////////////////////////////////////////////////////////
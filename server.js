//////////////////////////////////////////////////////////////////////////////////////////
// Code for connecting neon, render and github

const express = require("express");
const path = require("path");
const { Pool } = require("pg"); // connecting to neon PostgreSQL
require("dotenv").config();

// for encrypting data - in this case passwords
const bcrypt = require("bcrypt");
// below is the code for setting the constants that will be later be used for creating a shared user dashboard unique to each user
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session);

const app = express();

app.use(express.json()); // used to display the json
app.use(express.urlencoded({ extended: true })); // security add on that makes sure that it only returns middleware that only parses urlencoded bodies 
// In addition to only looking at requests where content header matches the type option requested



const port = process.env.PORT || 3000; //Port



// PostgreSQL / Neon connection with SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Testing DB connection
pool.connect()
  .then(() => console.log("Database connection successful"))
  .catch(err => console.error("Database connection error:", err));

app.set("trust proxy", 1);

// used for tracking the user sessions 
app.use(
  session({
    store: new pgSession({ // session infomation
      pool: pool,
      tableName: "BSS_user_sessions", 
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET, //ID Session cookie/tracker
    resave: false, // doesn't save session info
    saveUninitialized: false, // set to false to prevent uninitalised sessions from being saved
    cookie: { // setting objects for websites cookies
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ensures that the website cookies are only sent over https for security precautions - used for connecting with render 
      sameSite: "lax", // cookie is sent for navigating the BSS website while refusing most cross website requests
      maxAge: 1000 * 60 * 60 * 24, // keeps the cookie for 1 day / allows the user to stay logged in up to 1 day
    },
  })
);
/////////////////////////////////////////////////////////////////////////
//This piece of code ensures that users must login to get to a dashboard

function requireLogin(req, res, next) {
  if (!req.session.userId) {  // uses if statement to check if potential user is logged in
    return res.status(401).json({ error: "You must be logged in" }); // if false returns an error message
  }
  next(); // moves on to next task
}


//////////////////////////////////////////////////////////////////////////
/////////////////////////// ALL GETS are below this comment

// serves the files in public folder
app.use(express.static(path.join(__dirname, 'public')))

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

app.get("/api/dashboard", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, date_of_birth, gender, subject, degree_type, year_of_study_currunt, email, phone_num, description FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      req.session.destroy(() => { });
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      message: "Dashboard data loaded",
      user,
    });
  }
  catch (error) {
    console.error("Dashboard load error:", error);
    res.status(500).json({ error: "Server error" });
  }

})

app.get("/api/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email
       FROM users
       WHERE id = $1`,
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      req.session.destroy(() => { });
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Session lookup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Gets index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  ALL POSTS are below this comment
//post for adding new users to the database
app.post("/users", async (req, res) => {
  try {
    const first_name = String(req.body.first_name || "").trim();
    const last_name = String(req.body.last_name || "").trim();
    const date_of_birth = req.body.date_of_birth;
    const gender = String(req.body.gender || "").trim();
    const subject = String(req.body.subject || "").trim();
    const degree_type = String(req.body.degree_type || "").trim();
    const year_of_study_currunt = Number(req.body.year_of_study_currunt);
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone_num = String(req.body.phone_num || "").trim();
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
        (first_name, last_name, date_of_birth, gender, subject, degree_type, year_of_study_currunt, email, phone_num, description, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, first_name, last_name, date_of_birth, gender, subject, degree_type, year_of_study_currunt, email, phone_num, description;`,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        subject,
        degree_type,
        year_of_study_currunt,
        email,
        phone_num,
        description,
        password_hash,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("code:", err.code);
    console.error("constraint:", err.constraint);
    console.error("detail:", err.detail);

    if (err.code === "23505") {
      return res.status(409).json({
        error: `Unique constraint failed: ${err.constraint}`,
        detail: err.detail
      });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});



///////////////////////////////// ALL Listens are below this comment
//loads local server 
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


///////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// code in this box loads enviroments from the .env file that stores security data meant to be protected
// loads them into process.env 

require("dotenv").config();

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Code in this comment box is used to setup const that wil be used to connect the neon database with the render web server

const express = require("express"); // imports the express module and assigns it to a constant, is used to abstract complex tasks into simpler ones when devolping databases
const path = require("path"); // imports Nodes built in path module, assigns it to a const, Is used for handling files and directionary paths across the server
const { Pool } = require("pg"); // imports the pool class. A pool being a class that manages database connections, in this case the database in Neon
const bcrypt = require("bcrypt"); // imports bcrypt which is used to hash passwords
const session = require("express-session") // imports middleware to handle user sessions. Used for managing unique dashboards by remembering users between requests.
const pgSession = require("connect-pg-simple")(session); // imports connect-pg-simple that stores session data within the database instead of short term memory. session needs to be imported first


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// code in this box is used to create the const for connecting to Resend.
// an email delivery platform which will be used for our email verfication system
// in both the sign in and log in.

//const { Resend } = require("resend"); // imports resend allowing for email verfication
//const resend = new Resend(process.env.RESEND_KEY);// loads our protected data that being a key provided by Resend which will be used to authenticate our requests

const crypto = require("crypto"); // imports crypto which will be used to create tokens for email verfication
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// code here sets the port the server will run on
// process.env.PORT used for offical, 3000 for basic testing

const port = process.env.PORT || 3000; //Port

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
//code here sets up a constant of the express apllication instance
// routes and middleware are built off it, serves as primary object of all code in this js file
const app = express();
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
// app.use(express.json()); tells express to parse incoming requests off JSON data so that when JSON is sent from the body it becomes available as req.body
app.use(express.json());
//////////////////////////////////////////////////
app.use(express.urlencoded({ extended: true }));
//Tells express to parse urlencoded data that comes from the html forms into req.body that can be used 
// the extended: true is included so that it can parse more complex structures instead of simple key pair values if nessicary

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// creates a new pool that uses the envirmoent variable of the neon database url set up and stored in .env hidden within gitignore for security reasons
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, //enables SSL(secure) connection to the database, however { rejectUnauthorized: false } is used to not make it as strict
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Testing DB connection using the connect() methood and a then catch
pool.connect()
  .then(() => console.log("Database connection successful"))
  .catch(err => console.error("Database connection error:", err));

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// Tells the express that the application is running behind a proxy so that cookies are secure and are working well when usinng https via a proxy 
app.set("trust proxy", 1);
/////////////////////////////////////
/////////////////////////////////////////
// enables session support so app remembers users between requests
app.use(
  session({
    store: new pgSession({ // starts a new postgres session and stores the info pf it. These being pool, the database connection, tableName, where sessions are saved and createTableIfMissing: true that makes a new table if one isnt there
      pool: pool,
      tableName: "BSS_user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET, // checks secret key stored in env used to prevent tampering - security include
    resave: false, // doesn't save session info unless something has changed
    saveUninitialized: false, // set to false to prevent uninitalised sessions from being saved unless something has changed
    cookie: { // setting objects for websites cookies
      httpOnly: true, // only http can access the cookie not javascript
      secure: process.env.NODE_ENV === "production", // ensures that the website cookies are only sent over https for security precautions - used for connecting with render 
      sameSite: "lax", // cookie is sent for navigating the BSS website while refusing most cross website requests
      maxAge: 1000 * 60 * 60 * 24, // keeps the cookie for 1 day / allows the user to stay logged in up to 1 day
    },
  })
);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// serves the files in public folder
app.use(express.static(path.join(__dirname, 'public')))
/////////////////////////////////////////////////////////////////////////
//This piece of code ensures that users must login to get to a dashboard

function requireLogin(req, res, next) {
  if (!req.session.userId) {  // uses if statement to check if potential user is logged in
    return res.status(401).json({ error: "You must be logged in" }); // if false returns an error message
  }
  next(); // moves on to next middleware task
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////// ALL GETS are below this comment

// gets the front page
app.get("/", (req, res) => { // req, request from user, res, response sent back
  res.sendFile(path.join(__dirname, 'public', 'index.html')); //file path send back
}) //use of / forces this to be shown first above all else when url of website inputted

/////////////////////////////////////////////////////////////////////////////////////////

// Gets all users in database, used as a quick way of seeing databse server info
app.get("/users", async (req, res) => { // /users used to represent what it look like in url
  try {
    const { rows } = await pool.query("SELECT * FROM users;"); //Query for database
    res.json(rows); //prints results of JSON
  } catch (error) { // no valid status found
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: error.message });
  }
}); // use of try catch to catch errors

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GET for searching other users
app.get("/api/users/search", requireLogin, async (req, res) => { //Sets up GET
  try {
    const degree = String(req.query.degree || "").trim();  //Gets the degree being looked for


    if (!degree) { // checks for search term 
      return res.status(400).json({ error: "Please enter a search term" });
    }

    const result = await pool.query( // POSTGRES query
      `SELECT id, first_name, last_name, subject, degree_type, year_of_study_currunt, email, phone_num, description
       FROM users
       WHERE id != $1
       AND (
         LOWER(subject) LIKE LOWER($2)
         OR LOWER(degree_type) LIKE LOWER($2)
       )
       ORDER BY first_name, last_name`,
      [req.session.userId, `%${degree}%`]
    );

    res.json({ users: result.rows });
  } catch (error) { // Catch again
    console.error("User search error:", error); // for console 
    res.status(500).json({ error: error.message }); // for user
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET for unique dashboard
app.get("/api/dashboard", requireLogin, async (req, res) => { // /api/dashboard represnts a endpoint, requireLogin is used as middleware to ensure only logged in users can access it
  try {
    const result = await pool.query( // runs a sql query to get details from the databse users from a specifc user specified via $1 linked to  [req.session.userId]
      'SELECT id, first_name, last_name, date_of_birth, gender, subject, degree_type, year_of_study_currunt, email, phone_num, description FROM users WHERE id = $1',
      [req.session.userId]
    );

    // if no user found send 404 error and destroy the session

    if (result.rows.length === 0) {
      req.session.destroy(() => { });
      return res.status(404).json({ error: "User not found" });
    }

    // if user exists get the only matching one
    const user = result.rows[0];

    //sends a response to the JSON as listed when the GET function was initiated
    res.json({
      message: "Dashboard data loaded",
      user,
    });
  }
  // if error send back a error response 
  catch (error) {
    console.error("Dashboard load error:", error);
    res.status(500).json({ error: "Server error" });
  }

})

//////////////////////////////////////////////////////////////////////// 
///////////////////////////////////////////////////////////////////////



app.get("/api/me", async (req, res) => { // defines GET route
  if (!req.session.userId) { //checks if logged in 
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const result = await pool.query( //Query the databse
      `SELECT id, first_name, last_name, email
       FROM users
       WHERE id = $1`,
      [req.session.userId]
    );

    if (result.rows.length === 0) { // if no user found response error sent
      req.session.destroy(() => { });
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]); //else response sent as JSON data 
  } catch (error) { // catch for server error
    console.error("Session lookup error:", error); // console.error so can be seen within console UI
    res.status(500).json({ error: "Server error" }); // for user response error message
  }
});

//////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

app.get("/verify_email", async (req, res) => {
  try {
    const token = String(req.query.token).trim();

    if (!token) {
      return res.status(400).json({ error: "no token " });
    }

    const result = await pool.query(
      `SELECT id, verif_token_expires FROM users
       WHERE verif_token = $1`, [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid verification link");
    }

    const user = result.rows[0];

    if (new Date(user.verf_token_expires) < new Date()) {
      return res.status(400).send("Verification link expired");
    }

    await pool.query(
      `UPDATE users
       SET email_verif = true, verif_token = NULL, verif_token_expires = NULL
       WHERE id = $1`, [user.id]
    );

    res.send("Email verified successfully");

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Server error");
  }
});

app.put("/api/me", requireLogin, async (req, res) => { // defines a PUT request thats used for updating data 
  try {
    const first_name = String(req.body.first_name || "").trim();
    const last_name = String(req.body.last_name || "").trim();
    const date_of_birth = req.body.date_of_birth || null;
    const gender = String(req.body.gender || "").trim();
    const subject = String(req.body.subject || "").trim();
    const degree_type = String(req.body.degree_type || "").trim();
    const year_of_study_currunt = Number(req.body.year_of_study_currunt);
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone_num = String(req.body.phone_num || "").trim();
    const description = String(req.body.description || "").trim();
    // assigins requested data to Strings

    //basic if checks

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: "First name, last name and email are required" });
    }

    if (!Number.isInteger(year_of_study_currunt) || year_of_study_currunt < 1) {
      return res.status(400).json({ error: "Invalid year of study" });
    }

    if (description.length > 1000) {
      return res.status(400).json({ error: "Description too long" });
    }

    //SQL query to update the DATABASE

    const result = await pool.query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           date_of_birth = $3,
           gender = $4,
           subject = $5,
           degree_type = $6,
           year_of_study_currunt = $7,
           email = $8,
           phone_num = $9,
           description = $10
       WHERE id = $11
       RETURNING id, first_name, last_name, date_of_birth, gender, subject, degree_type, year_of_study_currunt, email, phone_num, description`, // returning sends back uisefull info
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
        req.session.userId
      ]
    );

    if (result.rows.length === 0) { // basic error check if no user found 
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ // if user found response send via JSON data
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (error) { // catch if error occur
    console.error("Profile update error:", error);

    if (error.code === "23505") { // response if email already in use
      return res.status(409).json({ error: "Email already in use" });
    }

    res.status(500).json({ error: "Server error" }); //response for user
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  ALL POSTS are below this comment
//post for adding new users to the database
app.post("/users", async (req, res) => { //sets up POST request, asyncronous as can happen any time allows wait apllies to all other asyncs aswell
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
    //hashing password for security

    const password_hash = await bcrypt.hash(password, 12);

    // we will also generate a token with an experation date in our database for our verfication process
    const verf_token = crypto.randomBytes(32).toString("hex");
    const verf_token_expire = new Date(Date.now() + 1000 * 60 * 60 * 24);

    //query uses placeholders to prevent SQL injection however we make email_verf false because all users will not be verfied when they first make there accounts
    // returned statement has no hash

    const result = await pool.query( // query inserting into database
      `INSERT INTO users
        (first_name, last_name, date_of_birth, gender, subject, degree_type, year_of_study_currunt, email, phone_num, description, password_hash, email_verif, verif_token, verif_token_expires)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false,$12,$13)
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
        verf_token,
        verf_token_expire
      ]
    );

    //after we have inserted the user into the database, we need to send the verfication email to our user 
    const verf_link = `https://bss-groupproject.onrender.com/verify_email?token=${verf_token}`;

    /*  await resend.emails.send({
       from: "STEP <onboarding@resend.dev>",
       to: [email],
       subject: "verfication of sign in",
       html:` 
         <h2>Welcome to BSS, ${first_name}!</h2>
         <p>Please verify your email address by clicking the link below:</p>
         <p><a href="${verf_link}">Verify my email</a></p>
         <p>This link expires in 24 hours.</p>
         `,
     }); */

    await transporter.sendMail({
      from: `"STEP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verfication to Sign In:",
      html: `
        <h2>Welcome to BSS, ${first_name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verf_link}">Verify my email</a></p>
        <p>This link expires in 24 hours.</p>`,
    });

    //res.json(result.rows[0]); //sends response of new data in JSON
    return res.status(201).json({
      message: "Account created successfully",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("code:", err.code);
    console.error("constraint:", err.constraint);
    console.error("detail:", err.detail);

    if (err.code === "23505") { // postgres error for duplicates, in this case the email already exists 
      return res.status(409).json({
        error: `Unique constraint failed: ${err.constraint}`,
        detail: err.detail  // respnse for user of the error
      });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" }); // response for user
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase(); // get email and password input from request 
    const password = String(req.body.password || "");

    if (!email || !password) { //ensures both fields are entered 
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query( // finds user in database
      `SELECT id, first_name, last_name, email, password_hash, email_verif
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) { // if user not found respond with a error
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0]; // user selected
    const passwordMatch = await bcrypt.compare(password, user.password_hash); // compares password inputed with passowrd hashed

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" }); // error message if passwords dont match
    }

    //if (!user.email_verif) {
    //  return res.status(403).json({ error: "Please verify your email first" });
    //}

    req.session.userId = user.id; // stores id in session 
    req.session.userEmail = user.email; // same with email

    res.json({ // sends JSON response of a succesful log in 
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) { // error catch
    console.error("Login error:", error); // for console UI
    res.status(500).json({ error: "Server error" }); // for user
  }
});

// Logout route
app.post("/logout", (req, res) => { // path POST for logout
  req.session.destroy((err) => { // destroys session
    if (err) { // error messages if cant log out/ unable to destroy session
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" }); // response to JSON as data if logout succesful
  });
});



///////////////////////////////// ALL Listens are below this comment
//loads local server 
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


///////////////////////////////////////////////////////////////////////////////////////////////


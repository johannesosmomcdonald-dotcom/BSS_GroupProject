//////////////////////////////////////////////////////////////////////////////////////////
// Code for connecting neon, render and github

const express = require("express");
const { path } = require("express/lib/application");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
//app.use(express.json());
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
/*
app.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users;"); //Query for database
    res.json(rows); //prints results of JSON
  } catch (error) { // no valid status found
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: error.message });
  }
});
*/

app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
})




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
///////////////////////////////////////////////////////////////////////////////////////////////
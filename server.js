/* =====================================================
   GigLink backend starter — Express + SQLite + bcrypt
   Run with: npm install && npm start
   Then serve your front-end files from /public, or point
   your Login.html's fetch() calls at this server's URL.
   ===================================================== */

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database(path.join(__dirname, "giglink.db"));

// ---- Database setup: creates the table on first run ----
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());

// Serve the GigLink front-end (Index.html, styles.css, app.js, etc.)
// Put all of those files inside a folder named "public" next to this file.
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "replace-this-with-a-long-random-string-before-deploying",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8-hour session
}));

// ---- Sign up: create a new account ----
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return res.status(409).json({ error: "That username is already taken." });
  }

  const hash = await bcrypt.hash(password, 10); // never store the plain password
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, hash);

  res.json({ success: true });
});

// ---- Log in: check credentials against the database ----
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  // Same generic error whether the username or password was wrong —
  // don't reveal which one, so attackers can't enumerate valid usernames.
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ success: true, username: user.username });
});

// ---- Log out ----
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ---- Example protected route: who am I? ----
app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }
  res.json({ username: req.session.username });
});

// ---- Example middleware to protect any other route ----
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }
  next();
}

// Example of a protected data route (profile, bookings, etc. would go here)
app.get("/api/profile", requireAuth, (req, res) => {
  res.json({ username: req.session.username, message: "This route only works when logged in." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GigLink backend running at http://localhost:${PORT}`));

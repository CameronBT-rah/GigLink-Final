# GigLink Backend Starter — real login with a database

This replaces the client-side `accounts = {...}` object in `Login.html` with a
real server that checks credentials against a SQLite database, using hashed
passwords (never stored in plain text) and a server-side session.

## 1. Why this is needed

The current `Login.html` checks usernames/passwords with JavaScript running
in the browser. That's fine for a demo, but it means:
- Anyone can read the account list by viewing the page source.
- There's no real signup — accounts are hardcoded in the file.
- There's no database, so nothing persists beyond what's in the code.

This starter fixes all three.

## 2. Setup

1. Install [Node.js](https://nodejs.org/) if you don't have it.
2. In this folder, run:
   ```
   npm install
   ```
3. Create a folder called `public` inside `backend-starter/` and copy your
   GigLink front-end files into it: `Index.html`, `My Profile.html`,
   `Availability.html`, `Bookings.html`, `Venue.html`, `Login.html`,
   `styles.css`, `app.js`.
4. Start the server:
   ```
   npm start
   ```
5. Open `http://localhost:3000` in your browser — you'll see your GigLink
   site, now served by the backend.

## 3. How the database works

On first run, `server.js` automatically creates a `giglink.db` SQLite file
with a `users` table:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Passwords are never stored directly — `bcrypt.hash()` turns a password into
a one-way scrambled hash before it's saved, and `bcrypt.compare()` checks a
login attempt against that hash without ever storing or logging the real
password.

## 4. Routes this server provides

| Method | Route | What it does |
|---|---|---|
| POST | `/api/signup` | Creates a new account (username + password) |
| POST | `/api/login` | Checks credentials, starts a session if correct |
| POST | `/api/logout` | Ends the session |
| GET | `/api/me` | Returns the logged-in username (401 if not logged in) |

## 5. Updating Login.html to use it

Replace the `accounts` object and `validateLogin()` in `Login.html` with:

```html
<script>
async function validateLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', data.username);
        window.location.href = 'Index.html';
    } else {
        errorDiv.style.display = 'block';
    }
}
</script>
```

To add a signup form, POST to `/api/signup` the same way, with a username
and password (8+ characters — the server already checks for that).

## 6. Creating a first account

Since the database starts empty, either:
- Add a small signup form to `Login.html` that POSTs to `/api/signup`, or
- Temporarily call the API directly, e.g. in your browser console on
  `http://localhost:3000`:
  ```js
  fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'cameron', password: 'a-real-password' })
  });
  ```

## 7. Known limitations / next steps

- `requireLogin()` in `app.js` still only checks `localStorage`, which the
  user can edit in dev tools. For real security, pages should instead call
  `/api/me` on load and redirect if it returns 401 — `localStorage` should
  only be used for display (like showing the username), not as the actual
  access check.
- The session secret in `server.js` is a placeholder — generate a real
  random string before deploying anywhere public.
- SQLite is great for development and small projects. For a production app
  with multiple users hitting it at once, you'd typically move to
  PostgreSQL or MySQL — the query code would look very similar.
- To put this online (not just `localhost`), you'd deploy it to a host that
  runs Node servers, e.g. Render, Railway, or Fly.io.

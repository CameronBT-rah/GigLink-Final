/* =====================================================
   GigLink — shared front-end logic
   A lightweight stand-in for a real backend/database.
   Everything here is stored in the browser's localStorage,
   scoped per logged-in username. See backend-starter/ for
   how to replace this with a real server + database.
   ===================================================== */

// ---- Session & navigation ----

function requireLogin() {
    if (localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "Login.html";
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    window.location.href = "Login.html";
}

function toggleNav() {
    const nav = document.getElementById("navLinks");
    if (nav) nav.classList.toggle("open");
}

function showWelcome() {
    const name = localStorage.getItem("username");
    const el = document.getElementById("welcomeMsg");
    if (name && el) el.textContent = "Welcome, " + name;
    return name;
}

function currentUser() {
    return localStorage.getItem("username") || "guest";
}

// ---- Profile ----

function getProfile() {
    const raw = localStorage.getItem("profile_" + currentUser());
    return raw ? JSON.parse(raw) : {
        role: "Add your role (e.g. Lead Vocalist / Guitarist)",
        location: "Add your location",
        bio: "Add a short bio so venues get a sense of your style and experience.",
        genres: ["Add a genre"]
    };
}

function saveProfile(data) {
    localStorage.setItem("profile_" + currentUser(), JSON.stringify(data));
}

// ---- Availability ----

function getAvailability() {
    const raw = localStorage.getItem("availability_" + currentUser());
    return raw ? JSON.parse(raw) : {};
}

function saveAvailability(data) {
    localStorage.setItem("availability_" + currentUser(), JSON.stringify(data));
}

// ---- Bookings ----

function getBookings() {
    const raw = localStorage.getItem("bookings_" + currentUser());
    return raw ? JSON.parse(raw) : [];
}

function saveBookings(list) {
    localStorage.setItem("bookings_" + currentUser(), JSON.stringify(list));
}

function addBooking(venueName) {
    const bookings = getBookings();
    bookings.push({ venue: venueName, date: "To be scheduled", status: "Pending" });
    saveBookings(bookings);
}

function removeBooking(index) {
    const bookings = getBookings();
    bookings.splice(index, 1);
    saveBookings(bookings);
}

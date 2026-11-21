/* =====================================================================
   login.js  -  One login form for ALL users (login.html)
   Part: Mim  |  Push 5
   ---------------------------------------------------------------------
   The user types a username, mobile number or email and a password.
   We find the account in the users array, check its status, and then
   a switch statement on the account's role picks the dashboard page.

   Pattern from Lecture 05 / Lab 04:
     return false  -> the form is not sent, the user stays on the page
     return true   -> the browser opens the page written in "action"
   ===================================================================== */


function validateLogin() {
  // 1. Read what the user typed (.value)
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value;

  let isValid = true;
  clearLoginErrors();

  // 2. Check the fields
  if (isEmpty(username)) {
    showError("username", "Please enter your username, mobile or email.");
    isValid = false;
  }

  if (isEmpty(password)) {
    showError("password", "Please enter your password.");
    isValid = false;
  } else if (password.length < 8) {
    showError("password", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // 3. Find the account: the username, the mobile OR the email can be used
  let foundUser = null;
  let typed = username.toLowerCase();
  for (const user of users) {
    if (user.username.toLowerCase() === typed || user.email.toLowerCase() === typed || user.phone === typed) {
      foundUser = user;
    }
  }

  if (foundUser === null || foundUser.password !== password) {
    showMessage("loginMessage", "Wrong username or password. Please try again.", "error");
    return false;
  }

  // 4. Only Active accounts may log in
  if (foundUser.status === "Pending") {
    showMessage("loginMessage", "Hello " + foundUser.name + ", your " + foundUser.role.toLowerCase() +
                " account is waiting for an admin to approve it. Please try again later.", "info");
    return false;
  }
  if (foundUser.status === "Banned") {
    showMessage("loginMessage", "This account is banned. Please contact the Agro Mart admin.", "error");
    return false;
  }

  // 5. Open the right dashboard for this role
  let form = document.getElementById("loginForm");
  switch (foundUser.role) {
    case "Admin":
      form.action = "admin-dashboard.html";
      break;
    case "Farmer":
      form.action = "farmer-dashboard.html";
      break;
    case "Customer":
      form.action = "customer-dashboard.html";
      break;
    case "Delivery":
      form.action = "delivery-dashboard.html";
      break;
  }

  console.log("Login OK: " + foundUser.name + " (" + foundUser.role + ") -> " + form.action);
  return true;
}


function clearLoginErrors() {
  clearErrors(["username", "password"]);
  hideMessage("loginMessage");
}


/* ---------------------------------------------------------------------
   CONNECT THE EVENTS (addEventListener - Lab 03)
   --------------------------------------------------------------------- */
document.getElementById("loginForm").addEventListener("submit", function (event) {
  if (validateLogin() === false) {
    event.preventDefault();          // same as "return false": stay on the page
  }
});

document.getElementById("showPassword").addEventListener("change", function () {
  togglePassword("showPassword", "password");
});

// fixed bugs in js css

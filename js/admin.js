// admin.js - Admin dashboard (Amin)
// Part 1: stat tiles + Manage Users (CRUD + search)

let editUserIndex = -1;
let editRateIndex = -1;
const userFields = ["userName", "userUsername", "userEmail", "userPhone", "userPassword", "userRole"];


// Stat tiles
function updateAdminStats() {
  let pending = 0;
  for (const user of users) {
    if (user.status === "Pending") {
      pending++;
    }
  }
  let openOrders = 0;
  for (const order of orders) {
    if (order.status !== "Delivered") {
      openOrders++;
    }
  }

  document.getElementById("statUsers").innerHTML = users.length;
  document.getElementById("statPending").innerHTML = pending;
  document.getElementById("statOrders").innerHTML = openOrders;
  document.getElementById("statProducts").innerHTML = products.length;
}

// Add a line to the recent actions board (newest first)
function addModerationLog(message) {
  moderationLog.unshift({ time: nowString(), message: message });
}


// Manage users: show + search
function renderUsers() {
  let keyword = document.getElementById("userSearch").value;
  let role = document.getElementById("userRoleFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let matchesKeyword = containsText(user.name, keyword) || containsText(user.username, keyword) ||
                         containsText(user.email, keyword) || containsText(user.phone, keyword) ||
                         containsText(user.id, keyword);
    let matchesRole = (role === "All" || user.role === role);

    if (matchesKeyword && matchesRole) {
      rows += "<tr>" +
                "<td>" + user.id + "</td>" +
                "<td><strong>" + user.name + "</strong><br><span class='hint'>" + user.email + "</span></td>" +
                "<td>" + user.username + "</td>" +
                "<td><span class='badge " + roleClass(user.role) + "'>" + user.role + "</span></td>" +
                "<td>" + statusBadge(user.status) + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editUser(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteUser(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No users match your search.</td></tr>";
  }
  document.getElementById("userTableBody").innerHTML = rows;
  document.getElementById("userCount").innerHTML = "Showing " + shown + " of " + users.length + " users";
}

// true when another user (not the one at skipIndex) already has this value
function usedByOther(property, value, skipIndex) {
  for (let i = 0; i < users.length; i++) {
    if (i !== skipIndex && String(users[i][property]).toLowerCase() === value.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Add or update a user
function saveUser() {
  let name = document.getElementById("userName").value.trim();
  let username = document.getElementById("userUsername").value.trim();
  let email = document.getElementById("userEmail").value.trim();
  let phone = document.getElementById("userPhone").value.trim();
  let password = document.getElementById("userPassword").value;
  let role = document.getElementById("userRole").value;
  let district = document.getElementById("userDistrict").value;

  let isValid = true;
  clearErrors(userFields);

  if (name.length < 3) {
    showError("userName", "Full name must be at least 3 characters.");
    isValid = false;
  }
  if (username.length < 4 || username.indexOf(" ") !== -1) {
    showError("userUsername", "Username must be at least 4 characters with no spaces.");
    isValid = false;
  } else if (usedByOther("username", username, editUserIndex)) {
    showError("userUsername", "This username is already taken.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("userEmail", "Please enter a valid email address.");
    isValid = false;
  } else if (usedByOther("email", email, editUserIndex)) {
    showError("userEmail", "Another account uses this email.");
    isValid = false;
  }
  if (isValidMobile(phone) === false) {
    showError("userPhone", "Mobile must be 11 digits and start with 01.");
    isValid = false;
  }
  // When editing, an empty password keeps the old one
  if (editUserIndex === -1 || password !== "") {
    if (password.length < 8) {
      showError("userPassword", "Password must be at least 8 characters.");
      isValid = false;
    }
  }
  if (role === "") {
    showError("userRole", "Please choose a role.");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  if (editUserIndex === -1) {
    // Accounts made by the admin are Active straight away
    let newUser = { id: nextId("U", users), name: name, username: username, password: password, email: email,
                    phone: phone, role: role, status: "Active", district: district };
    users.push(newUser);
    addModerationLog("Created " + role.toLowerCase() + " account for " + name);
    showMessage("userMessage", "User <strong>" + name + "</strong> was added (" + newUser.id + ").", "success");
  } else {
    let user = users[editUserIndex];
    user.name = name;
    user.username = username;
    user.email = email;
    user.phone = phone;
    user.role = role;
    user.district = district;
    if (password !== "") {
      user.password = password;
    }
    showMessage("userMessage", "User <strong>" + name + "</strong> was updated.", "success");
  }

  resetUserForm();
  refreshAdminPage();
  return false;
}

// Put a user into the form for editing
function editUser(index) {
  let user = users[index];
  editUserIndex = index;

  document.getElementById("userName").value = user.name;
  document.getElementById("userUsername").value = user.username;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userPhone").value = user.phone;
  document.getElementById("userPassword").value = "";
  document.getElementById("userPassword").placeholder = "Leave empty to keep the old password";
  document.getElementById("userRole").value = user.role;
  document.getElementById("userDistrict").value = user.district;

  document.getElementById("userFormTitle").innerHTML = "Edit User " + user.id;
  document.getElementById("userSaveButton").value = "Update User";
  clearErrors(userFields);
}

// Delete a user
function deleteUser(index) {
  let user = users[index];
  if (user.id === currentAdminId) {
    showMessage("userMessage", "You cannot delete your own account.", "error");
    return;
  }
  if (confirm("Delete the account of " + user.name + "?") === false) {
    return;
  }
  users = removeAt(users, index);
  addModerationLog("Deleted account of " + user.name);
  showMessage("userMessage", "User <strong>" + user.name + "</strong> was deleted.", "info");
  resetUserForm();
  refreshAdminPage();
}

function resetUserForm() {
  document.getElementById("userForm").reset();
  editUserIndex = -1;
  document.getElementById("userPassword").placeholder = "At least 8 characters";
  document.getElementById("userFormTitle").innerHTML = "Add New User";
  document.getElementById("userSaveButton").value = "Add User";
  clearErrors(userFields);
}


// Events
document.getElementById("userForm").addEventListener("submit", function (event) {
  event.preventDefault();
  saveUser();
});
document.querySelector("#userForm .btn-secondary").addEventListener("click", resetUserForm);
document.getElementById("userSearch").addEventListener("keyup", renderUsers);
document.getElementById("userRoleFilter").addEventListener("change", renderUsers);

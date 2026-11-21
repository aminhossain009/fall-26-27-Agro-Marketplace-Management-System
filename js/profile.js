/* =====================================================================
   profile.js  -  My Profile page (profile.html)
   ---------------------------------------------------------------------
   Every dashboard links here with the user id in the URL:
   profile.html?user=U-002. The form is filled from that user object and
   "Save Changes" validates the fields and updates the object.
   Without an id the demo customer is shown.
   ===================================================================== */

const profileFields = ["profileName", "profilePhone", "profileEmail"];


// Reads "U-002" from "?user=U-002"
function readUserId() {
  let query = window.location.search;
  let position = query.indexOf("user=");
  if (position === -1) {
    return currentCustomerId;
  }
  let id = query.slice(position + 5);
  let end = id.indexOf("&");
  if (end !== -1) {
    id = id.slice(0, end);
  }
  return id;
}

let profileUser = findUser(readUserId());
if (profileUser == null) {
  profileUser = findUser(currentCustomerId);
}

// The dashboard page of each role
function dashboardPage(role) {
  switch (role) {
    case "Admin":    return "admin-dashboard.html";
    case "Farmer":   return "farmer-dashboard.html";
    case "Delivery": return "delivery-dashboard.html";
    default:         return "customer-dashboard.html";
  }
}

// A customer's address comes from the first saved address
function profileAddress(user) {
  if (user.address != null) {
    return user.address;
  }
  for (const address of addresses) {
    if (address.customerId === user.id) {
      return address.details;
    }
  }
  return "";
}

function fillProfile() {
  let badge = document.getElementById("profileBadge");
  badge.innerHTML = profileUser.role;
  badge.className = "badge " + roleClass(profileUser.role);
  document.getElementById("dashboardLink").href = dashboardPage(profileUser.role);

  document.getElementById("profileName").value = profileUser.name;
  document.getElementById("profilePhone").value = profileUser.phone;
  document.getElementById("profileEmail").value = profileUser.email;
  document.getElementById("profileDistrict").value = profileUser.district;
  document.getElementById("profileAddress").value = profileAddress(profileUser);
}

// true when another user already has this value
function profileValueTaken(property, value) {
  for (const user of users) {
    if (user.id !== profileUser.id && String(user[property]).toLowerCase() === value.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function saveProfile() {
  let name = document.getElementById("profileName").value.trim();
  let phone = document.getElementById("profilePhone").value.trim();
  let email = document.getElementById("profileEmail").value.trim();
  let district = document.getElementById("profileDistrict").value;
  let address = document.getElementById("profileAddress").value.trim();

  let isValid = true;
  clearErrors(profileFields);
  hideMessage("profileMessage");

  if (name.length < 3) {
    showError("profileName", "Full name must be at least 3 characters.");
    isValid = false;
  }
  if (isValidMobile(phone) === false) {
    showError("profilePhone", "Mobile must be 11 digits and start with 01.");
    isValid = false;
  } else if (profileValueTaken("phone", phone)) {
    showError("profilePhone", "This mobile number is already registered.");
    isValid = false;
  }
  if (isValidEmail(email) === false) {
    showError("profileEmail", "Please enter a valid email address.");
    isValid = false;
  } else if (profileValueTaken("email", email)) {
    showError("profileEmail", "Another account uses this email.");
    isValid = false;
  }
  if (isValid === false) {
    showMessage("profileMessage", "Please fix the fields marked in red.", "error");
    return false;
  }

  profileUser.name = name;
  profileUser.phone = phone;
  profileUser.email = email;
  profileUser.district = district;
  profileUser.address = address;

  showMessage("profileMessage", "Your profile was saved." +
              "<br><span class='hint'>Frontend version: changes are kept until this page reloads.</span>", "success");
  return false;
}


// Events
document.getElementById("profileForm").addEventListener("submit", function (event) {
  event.preventDefault();
  saveProfile();
});


// Start
fillProfile();

// fixed bugs in js css

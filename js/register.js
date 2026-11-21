/* =====================================================================
   register.js  -  One registration form for Customer, Farmer, Delivery
   Part: Mim  |  Push 6
   ---------------------------------------------------------------------
   1. The user picks a type with the "userType" radio buttons.
   2. showTypeFields() shows the common fields plus ONLY the fieldset
      for that type, using  element.style.display  (DOM + CSS).
   3. validateRegister() checks the common fields, then uses a switch
      to check the fields of the chosen type.
   4. If everything is valid, a new user object is push()ed into the
      users array. Farmers and delivery men start as "Pending" until
      an admin approves them.
   ===================================================================== */

// Fields shared by every type of user
const commonFields = ["userType", "fullName", "email", "phone", "district", "address",
                      "newUsername", "newPassword", "confirmPassword"];
// Fields that belong to one type only
const farmerFields = ["farmerNid", "farmName", "land"];
const deliveryFields = ["deliveryNid", "vehicle", "deliveryArea"];


/* ---------------------------------------------------------------------
   SHOW THE RIGHT FIELDS FOR THE CHOSEN TYPE
   --------------------------------------------------------------------- */
function showTypeFields() {
  let type = getRadioValue("userType");

  // The rest of the form appears once any type is chosen
  document.getElementById("formBody").style.display = (type === "") ? "none" : "block";

  // Show one type fieldset, hide the other two
  document.getElementById("customerFields").style.display = (type === "Customer") ? "block" : "none";
  document.getElementById("farmerFields").style.display = (type === "Farmer") ? "block" : "none";
  document.getElementById("deliveryFields").style.display = (type === "Delivery") ? "block" : "none";

  // Highlight the chosen card (className changes which CSS rule applies)
  document.getElementById("typeCardCustomer").className = (type === "Customer") ? "type-option selected" : "type-option";
  document.getElementById("typeCardFarmer").className = (type === "Farmer") ? "type-option selected" : "type-option";
  document.getElementById("typeCardDelivery").className = (type === "Delivery") ? "type-option selected" : "type-option";

  // The button text tells the user what will be created
  if (type === "Delivery") {
    document.getElementById("registerButton").value = "Create Delivery Man Account";
  } else if (type !== "") {
    document.getElementById("registerButton").value = "Create " + type + " Account";
  }

  clearAllRegisterErrors();
}


/* ---------------------------------------------------------------------
   PASSWORD STRENGTH (onkeyup) - counts what the password contains
   --------------------------------------------------------------------- */
function showPasswordStrength() {
  let password = document.getElementById("newPassword").value;
  let text = document.getElementById("strengthText");

  let hasDigit = false;
  let hasUpper = false;
  for (let i = 0; i < password.length; i++) {
    if ("0123456789".indexOf(password[i]) !== -1) {
      hasDigit = true;
    }
    if (password[i] >= "A" && password[i] <= "Z") {
      hasUpper = true;
    }
  }

  let score = 0;
  if (password.length >= 8) { score++; }
  if (hasDigit) { score++; }
  if (hasUpper) { score++; }

  if (password.length === 0) {
    text.innerHTML = "";
  } else if (score <= 1) {
    text.innerHTML = "Strength: weak";
    text.style.color = "#C62828";
  } else if (score === 2) {
    text.innerHTML = "Strength: medium";
    text.style.color = "#EF6C00";
  } else {
    text.innerHTML = "Strength: strong";
    text.style.color = "#2E7D32";
  }
}


/* ---------------------------------------------------------------------
   VALIDATION
   --------------------------------------------------------------------- */
function validateRegister() {
  let type = getRadioValue("userType");
  clearAllRegisterErrors();

  if (type === "") {
    showError("userType", "Please choose the type of account.");
    return false;
  }

  // Run the common checks and the checks for this type
  let commonOk = validateCommon();
  let typeOk = true;

  switch (type) {
    case "Farmer":
      typeOk = validateFarmer();
      break;
    case "Delivery":
      typeOk = validateDelivery();
      break;
    // A customer only chooses a payment method, which always has a value
  }

  if (!(commonOk && typeOk)) {
    showMessage("registerMessage", "Please fix the fields marked in red.", "error");
    return false;
  }

  // ----- Everything is valid: build the new user object -----
  let newUser = {
    id: nextId("U", users),
    name: document.getElementById("fullName").value.trim(),
    username: document.getElementById("newUsername").value.trim(),
    password: document.getElementById("newPassword").value,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    district: document.getElementById("district").value,
    address: document.getElementById("address").value.trim(),
    role: type,
    status: "Active"
  };

  // Add the properties that only this type has
  if (type === "Customer") {
    newUser.preferredPayment = document.getElementById("preferredPayment").value;
  } else if (type === "Farmer") {
    newUser.nid = document.getElementById("farmerNid").value.trim();
    newUser.farmName = document.getElementById("farmName").value.trim();
    newUser.land = Number(document.getElementById("land").value);
    newUser.status = "Pending";              // an admin must approve farmers
  } else {
    newUser.nid = document.getElementById("deliveryNid").value.trim();
    newUser.vehicle = getRadioValue("vehicle");
    newUser.deliveryArea = document.getElementById("deliveryArea").value.trim();
    newUser.status = "Pending";              // an admin must approve delivery men
  }

  users.push(newUser);
  console.log("New user:", newUser);

  let text = "Welcome, <strong>" + newUser.name + "</strong>! Your account was created (user id " + newUser.id + "). ";
  if (newUser.status === "Pending") {
    text += "An admin will check your details; you can log in after approval.";
  } else {
    text += "<a href='login.html'>Log in now</a>.";
  }
  text += "<br><span class='hint'>Frontend version: the account is kept until this page reloads. " +
          "The PHP backend will save it permanently.</span>";
  // Empty the form and go back to step 1.
  // showTypeFields() hides the message box, so the message is shown AFTER it.
  document.getElementById("registerForm").reset();
  showTypeFields();
  document.getElementById("registerButton").disabled = true;
  document.getElementById("registerButton").value = "Create Account";
  document.getElementById("strengthText").innerHTML = "";
  showMessage("registerMessage", text, "success");
  return false;   // stay on this page so the message can be read
}


// Checks shared by every type
function validateCommon() {
  let isValid = true;

  let fullName = document.getElementById("fullName").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let district = document.getElementById("district").value;
  let address = document.getElementById("address").value.trim();
  let username = document.getElementById("newUsername").value.trim();
  let password = document.getElementById("newPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (fullName.length < 3) {
    showError("fullName", "Full name must be at least 3 characters.");
    isValid = false;
  }

  if (isEmpty(email)) {
    showError("email", "Email is required.");
    isValid = false;
  } else if (isValidEmail(email) === false) {
    showError("email", "Please enter a valid email address.");
    isValid = false;
  } else if (isTaken("email", email)) {
    showError("email", "An account with this email already exists.");
    isValid = false;
  }

  if (isValidMobile(phone) === false) {
    showError("phone", "Mobile must be 11 digits and start with 01.");
    isValid = false;
  } else if (isTaken("phone", phone)) {
    showError("phone", "This mobile number is already registered.");
    isValid = false;
  }

  if (district === "") {
    showError("district", "Please choose your district.");
    isValid = false;
  }

  if (address.length < 5) {
    showError("address", "Please write your address (at least 5 characters).");
    isValid = false;
  }

  if (username.length < 4 || username.indexOf(" ") !== -1) {
    showError("newUsername", "Username must be at least 4 characters with no spaces.");
    isValid = false;
  } else if (isTaken("username", username)) {
    showError("newUsername", "This username is already taken.");
    isValid = false;
  }

  let hasDigit = false;
  for (let i = 0; i < password.length; i++) {
    if ("0123456789".indexOf(password[i]) !== -1) {
      hasDigit = true;
    }
  }
  if (password.length < 8 || hasDigit === false) {
    showError("newPassword", "Password must be at least 8 characters and contain a digit.");
    isValid = false;
  }

  if (confirmPassword !== password || confirmPassword === "") {
    showError("confirmPassword", "The two passwords do not match.");
    isValid = false;
  }

  return isValid;
}

function validateFarmer() {
  let isValid = true;
  let nid = document.getElementById("farmerNid").value.trim();
  let farmName = document.getElementById("farmName").value.trim();
  let land = document.getElementById("land").value;

  if (isValidNid(nid) === false) {
    showError("farmerNid", "NID must be 10, 13 or 17 digits.");
    isValid = false;
  }
  if (farmName.length < 3) {
    showError("farmName", "Please enter your farm name.");
    isValid = false;
  }
  if (land === "" || Number(land) < 1) {
    showError("land", "Land must be at least 1 bigha.");
    isValid = false;
  }
  return isValid;
}

function validateDelivery() {
  let isValid = true;
  let nid = document.getElementById("deliveryNid").value.trim();
  let area = document.getElementById("deliveryArea").value.trim();

  if (isValidNid(nid) === false) {
    showError("deliveryNid", "NID must be 10, 13 or 17 digits.");
    isValid = false;
  }
  if (getRadioValue("vehicle") === "") {
    showError("vehicle", "Please choose your vehicle.");
    isValid = false;
  }
  if (area.length < 3) {
    showError("deliveryArea", "Please enter the area you deliver to.");
    isValid = false;
  }
  return isValid;
}

// true when another user already has this value, e.g. isTaken("email", "a@b.com")
// user[property] reads a property whose name is in a variable
function isTaken(property, value) {
  for (const user of users) {
    if (String(user[property]).toLowerCase() === value.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function clearAllRegisterErrors() {
  clearErrors(commonFields.concat(farmerFields).concat(deliveryFields));
  hideMessage("registerMessage");
}


/* ---------------------------------------------------------------------
   CONNECT THE EVENTS (addEventListener - Lab 03)
   --------------------------------------------------------------------- */
let typeRadios = document.getElementsByName("userType");
for (let i = 0; i < typeRadios.length; i++) {
  typeRadios[i].addEventListener("change", showTypeFields);
}

document.getElementById("newPassword").addEventListener("keyup", showPasswordStrength);

// The Create Account button stays disabled until the terms are ticked
// (Week 02-03 "DHTML in our form")
document.getElementById("registerButton").disabled = true;
document.getElementById("terms").addEventListener("change", function () {
  document.getElementById("registerButton").disabled = !document.getElementById("terms").checked;
});

document.getElementById("registerForm").addEventListener("submit", function (event) {
  if (validateRegister() === false) {
    event.preventDefault();
  }
});

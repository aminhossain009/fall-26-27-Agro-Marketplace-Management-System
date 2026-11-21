let sections = [];

function setupSections() {
  let found = document.getElementsByClassName("page-section");
  for (let i = 0; i < found.length; i++) {
    sections.push(found[i].id);
  }
  if (sections.length === 0) {
    return;                        
  }

  
  let links = document.querySelectorAll(".topnav a");
  for (let i = 0; i < links.length; i++) {
    let href = links[i].getAttribute("href");
    if (href.charAt(0) === "#") {
      links[i].addEventListener("click", function (event) {
        event.preventDefault();     
        showSection(href.slice(1));
      });
    }
  }
  showSection(sections[0]);
}

function showSection(sectionId) {
  for (let i = 0; i < sections.length; i++) {
    let section = document.getElementById(sections[i]);
    section.style.display = (sections[i] === sectionId) ? "block" : "none";
  }

  
  let links = document.querySelectorAll(".topnav a");
  for (let i = 0; i < links.length; i++) {
    links[i].className = (links[i].getAttribute("href") === "#" + sectionId) ? "active" : "";
  }
}



function showError(fieldId, message) {
  document.getElementById(fieldId + "Error").innerHTML = message;

  // Radio-button groups have no single element with this id, so check first
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "2px solid red";
  }
}

function clearError(fieldId) {
  let errorBox = document.getElementById(fieldId + "Error");
  if (errorBox != null) {
    errorBox.innerHTML = "";
  }
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "";      
  }
}

// Clears the errors of many fields at once;
function clearErrors(fieldIds) {
  for (let i = 0; i < fieldIds.length; i++) {
    clearError(fieldIds[i]);
  }
}



function showMessage(boxId, text, type) {
  let box = document.getElementById(boxId);
  box.innerHTML = text;
  box.className = "message " + type;
  box.style.display = "block";
}

function hideMessage(boxId) {
  document.getElementById(boxId).style.display = "none";
}





function isEmpty(value) {
  return value.trim() === "";
}


function isValidEmail(email) {
  let atPosition = email.indexOf("@");
  let dotPosition = email.indexOf(".", atPosition);

  if (atPosition < 1) {
    return false;                       
  }
  if (dotPosition < atPosition + 2) {
    return false;                       
  }
  if (dotPosition === email.length - 1) {
    return false;                      
  }
  return true;
}


function isDigitsOnly(text) {
  if (text.length === 0) {
    return false;
  }
  let digits = "0123456789";
  for (let i = 0; i < text.length; i++) {
    if (digits.indexOf(text[i]) === -1) {
      return false;
    }
  }
  return true;
}


function isValidMobile(phone) {
  return isDigitsOnly(phone) && phone.length === 11 && phone.slice(0, 2) === "01";
}

// NID: 10, 13 or 17 digits
function isValidNid(nid) {
  return isDigitsOnly(nid) && (nid.length === 10 || nid.length === 13 || nid.length === 17);
}


function getRadioValue(groupName) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}


function setRadioValue(groupName, value) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === value);
  }
}


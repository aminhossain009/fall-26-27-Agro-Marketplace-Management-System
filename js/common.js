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


/*
   5. SEARCH HELPER
    */
function containsText(text, keyword) {
  return String(text).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
}


/* 
   6. ARRAY HELPERS
    */

// Finds the position (index) of the object whose id matches, or -1
function findIndexById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Returns a NEW array without the element at "index".
// slice() copies part of an array and concat() joins two arrays (Lecture 05).
function removeAt(list, index) {
  return list.slice(0, index).concat(list.slice(index + 1));
}

// Makes the next id, e.g. nextId("P", products) gives "P-110"
// It looks for the biggest number already used and adds 1,
// keeping the same number of digits ("U-009" -> "U-010").
function nextId(prefix, list) {
  let biggest = 0;
  let digits = 3;
  for (let i = 0; i < list.length; i++) {
    let numberText = list[i].id.slice(prefix.length + 1);   // "U-007" -> "007"
    digits = numberText.length;
    if (Number(numberText) > biggest) {
      biggest = Number(numberText);
    }
  }

  let newNumber = String(biggest + 1);
  while (newNumber.length < digits) {
    newNumber = "0" + newNumber;
  }
  return prefix + "-" + newNumber;
}

// Finds a product by id in the products list OR the out-of-stock list
function findProduct(productId) {
  let index = findIndexById(products, productId);
  if (index !== -1) {
    return products[index];
  }
  index = findIndexById(outOfStockProducts, productId);
  if (index !== -1) {
    return outOfStockProducts[index];
  }
  return null;
}

// Finds a user object by id, or null
function findUser(userId) {
  let index = findIndexById(users, userId);
  return (index === -1) ? null : users[index];
}


/* 
   7. MONEY AND DATE HELPERS
*/

// 18200 -> "Tk 18,200"  (a comma after every 3 digits, made with a loop)
function formatTaka(amount) {
  let text = String(Math.round(amount));
  let result = "";
  let count = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    result = text[i] + result;
    count++;
    if (count % 3 === 0 && i > 0 && text[i - 1] !== "-") {
      result = "," + result;
    }
  }
  return "Tk " + result;
}

// Today's date as "YYYY-MM-DD"
function todayString() {
  let now = new Date();
  let month = now.getMonth() + 1;          
  let day = now.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return now.getFullYear() + "-" + month + "-" + day;
}

// Adds "days" to a date text and returns the new date text
function addDays(dateText, days) {
  let date = new Date(dateText + "T00:00");   
  date.setDate(date.getDate() + days);
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return date.getFullYear() + "-" + month + "-" + day;
}

// Number of days from firstDate to secondDate (negative if secondDate is earlier)
function daysBetween(firstDate, secondDate) {
  let oneDay = 1000 * 60 * 60 * 24;          // milliseconds in one day
  let difference = new Date(secondDate + "T00:00") - new Date(firstDate + "T00:00");
  return Math.round(difference / oneDay);
}

// The current date and time as "YYYY-MM-DD HH:MM" (for the logs)
function nowString() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  return todayString() + " " + hours + ":" + minutes;
}


/* 
   8. SMALL HTML BUILDERS (used by many pages)
    */

// The small 40x40 photo shown in tables (or a grey "No photo" box)
function thumbHtml(product) {
  if (product.image === "" || product.image == null) {
    return "<div class='thumb no-image'>No photo</div>";
  }
  return "<img width='40' height='40' class='thumb' src='" + product.image + "' alt='" + product.name + "'>";
}

// The badge for stock: green, orange (low) or red (none)
function stockBadge(product) {
  if (product.stock === 0) {
    return "<span class='badge red'>Out of stock</span>";
  } else if (product.stock <= lowStockLimit) {
    return "<span class='badge orange'>Only " + product.stock + " left</span>";
  }
  return "<span class='badge green'>In stock</span>";
}

// The colour class of a role badge: "Farmer" -> "farmer"
function roleClass(role) {
  return role.toLowerCase();
}

// The colour of a status badge (switch - Week 06)
function statusBadge(status) {
  let colour;
  switch (status) {
    case "Active":
    case "Delivered":
    case "Paid":
      colour = "green";
      break;
    case "Pending":
    case "Packed":
      colour = "orange";
      break;
    case "Banned":
      colour = "red";
      break;
    case "Picked":
    case "On the way":
      colour = "blue";
      break;
    default:
      colour = "grey";
  }
  return "<span class='badge " + colour + "'>" + status + "</span>";
}


/* 
   9. SEARCH ALL PRODUCTS (read only table)
 */
function renderCatalog() {
  let keyword = document.getElementById("catalogSearch").value;
  let category = document.getElementById("catalogCategory").value;

  let rows = "";
  let shown = 0;

  for (const product of products) {
    let matchesKeyword = containsText(product.name, keyword) || containsText(product.farmer, keyword) ||
                         containsText(product.district, keyword);
    let matchesCategory = (category === "All" || product.category === category);

    if (matchesKeyword && matchesCategory) {
      rows += "<tr>" +
                "<td>" + thumbHtml(product) + "<strong>" + product.name + "</strong></td>" +
                "<td>" + product.farmer + "<br><span class='hint'>" + product.district + "</span></td>" +
                "<td>" + product.category + "</td>" +
                "<td>Tk " + product.price + " / " + product.unit + "</td>" +
                "<td>" + stockBadge(product) + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>No products match your search.</td></tr>";
  }

  document.getElementById("catalogBody").innerHTML = rows;
  document.getElementById("catalogCount").innerHTML = shown + " product(s) found";
}

// Connects the search box and the category list to renderCatalog()

function setupCatalog() {
  if (document.getElementById("catalogBody") == null) {
    return;                       // this page has no catalogue table
  }
  document.getElementById("catalogSearch").addEventListener("keyup", renderCatalog);
  document.getElementById("catalogCategory").addEventListener("change", renderCatalog);
  renderCatalog();
}


/*
   9b. READ THE SEARCH WORD FROM THE URL
   The hero search sends the word in the URL: products.html?q=rice
   location.search gives "?q=rice"; we take the text after "q=".
*/
function readSearchWord() {
  let query = window.location.search;
  let position = query.indexOf("q=");
  if (position === -1) {
    return "";
  }
  let word = query.slice(position + 2);
  let end = word.indexOf("&");
  if (end !== -1) {
    word = word.slice(0, end);
  }
  // "+" means a space in a URL; decodeURIComponent turns %20 etc. back into letters
  try {
    return decodeURIComponent(word.split("+").join(" "));
  } catch (error) {
    return "";                    // a broken "%" in the URL
  }
}


/*
   10. "SHOW PASSWORD" CHECKBOX (login page)
    */
function togglePassword(checkboxId, inputId) {
  let input = document.getElementById(inputId);
  input.type = document.getElementById(checkboxId).checked ? "text" : "password";
}


// Runs on every page that loads common.js
setupSections();
setupCatalog();

// fixed bugs in js css

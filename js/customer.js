/* =====================================================================
   customer.js  -  Customer dashboard (customer.html)
  -----------------------------------
   CRUD + Search : My Delivery Addresses
   Unique 1      : Cart and Checkout - stock check, total, place order
   Unique 2      : Order Tracking - Placed > Packed > Picked > On the way > Delivered
   Unique 3      : Review and Rating - only for products that were delivered
   Extra alerts  : Price Drop Alerts and Back-in-Stock Alerts
   ===================================================================== */

/* #####################################################################
   Statistic tiles + Addresses (CRUD + Search) + Cart and Checkout
   ##################################################################### */


let editAddressIndex = -1;
let editPriceAlertIndex = -1;
const addressFields = ["addressRecipient", "addressPhone", "addressArea", "addressDetails"];


/* =====================================================================
   STATISTIC TILES
   ===================================================================== */
function countMine(list) {
  let count = 0;
  for (const item of list) {
    if (item.customerId === currentCustomerId) {
      count++;
    }
  }
  return count;
}

function updateCustomerStats() {
  let cartItems = 0;
  for (const item of cart) {
    cartItems += item.qty > 0 ? 1 : 0;
  }

  let activeOrders = 0;
  for (const order of orders) {
    if (order.customerId === currentCustomerId && order.status !== "Delivered") {
      activeOrders++;
    }
  }

  document.getElementById("statCart").innerHTML = cartItems;
  document.getElementById("statOrders").innerHTML = activeOrders;
  document.getElementById("statAddresses").innerHTML = countMine(addresses);
  document.getElementById("statReviews").innerHTML = countMine(reviews);
  document.getElementById("statPriceAlerts").innerHTML = countMine(priceAlerts);
  document.getElementById("statStockAlerts").innerHTML = countMine(stockAlerts);
}


/* =====================================================================
   1. MY DELIVERY ADDRESSES  (CRUD + SEARCH)
   ===================================================================== */
function renderAddresses() {
  let keyword = document.getElementById("addressSearch").value;
  let label = document.getElementById("addressLabelFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < addresses.length; i++) {
    let address = addresses[i];
    if (address.customerId !== currentCustomerId) {
      continue;
    }
    let matchesKeyword = containsText(address.recipient, keyword) || containsText(address.area, keyword) ||
      containsText(address.details, keyword) || containsText(address.district, keyword);
    let matchesLabel = (label === "All" || address.label === label);

    if (matchesKeyword && matchesLabel) {
      rows += "<tr>" +
        "<td><span class='badge blue'>" + address.label + "</span></td>" +
        "<td><strong>" + address.recipient + "</strong><br><span class='hint'>" + address.phone + "</span></td>" +
        "<td class='wrap'>" + address.details + "<br><span class='hint'>" + address.area + ", " + address.district + "</span></td>" +
        "<td>" +
        "<button type='button' class='btn btn-small' onclick='editAddress(" + i + ")'>Edit</button>" +
        "<button type='button' class='btn btn-small btn-danger' onclick='deleteAddress(" + i + ")'>Delete</button>" +
        "</td>" +
        "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='4' class='empty-row'>No addresses found.</td></tr>";
  }
  document.getElementById("addressBody").innerHTML = rows;
  document.getElementById("addressCount").innerHTML = shown + " address(es)";
}

function saveAddress() {
  let label = getRadioValue("addressLabel");
  let recipient = document.getElementById("addressRecipient").value.trim();
  let phone = document.getElementById("addressPhone").value.trim();
  let area = document.getElementById("addressArea").value.trim();
  let district = document.getElementById("addressDistrict").value;
  let details = document.getElementById("addressDetails").value.trim();

  let isValid = true;
  clearErrors(addressFields);

  if (recipient.length < 3) {
    showError("addressRecipient", "Recipient name must be at least 3 characters.");
    isValid = false;
  }
  if (isValidMobile(phone) === false) {
    showError("addressPhone", "Mobile must be 11 digits and start with 01.");
    isValid = false;
  }
  if (area.length < 2) {
    showError("addressArea", "Please enter the area.");
    isValid = false;
  }
  if (details.length < 5) {
    showError("addressDetails", "Please write the house and road (at least 5 characters).");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  if (editAddressIndex === -1) {
    let newAddress = {
      id: nextId("A", addresses), customerId: currentCustomerId, label: label, recipient: recipient,
      phone: phone, area: area, district: district, details: details
    };
    addresses.push(newAddress);
    showMessage("addressMessage", "New " + label.toLowerCase() + " address saved.", "success");
  } else {
    let address = addresses[editAddressIndex];
    address.label = label;
    address.recipient = recipient;
    address.phone = phone;
    address.area = area;
    address.district = district;
    address.details = details;
    showMessage("addressMessage", "Address updated.", "success");
  }

  resetAddressForm();
  refreshCustomerPage();
  return false;
}

function editAddress(index) {
  let address = addresses[index];
  editAddressIndex = index;

  setRadioValue("addressLabel", address.label);
  document.getElementById("addressRecipient").value = address.recipient;
  document.getElementById("addressPhone").value = address.phone;
  document.getElementById("addressArea").value = address.area;
  document.getElementById("addressDistrict").value = address.district;
  document.getElementById("addressDetails").value = address.details;

  document.getElementById("addressFormTitle").innerHTML = "Edit Address";
  document.getElementById("addressSaveButton").value = "Update Address";
  clearErrors(addressFields);
}

function deleteAddress(index) {
  if (confirm("Delete this address?") === false) {
    return;
  }
  addresses = removeAt(addresses, index);
  showMessage("addressMessage", "Address deleted.", "info");
  resetAddressForm();
  refreshCustomerPage();
}

function resetAddressForm() {
  document.getElementById("addressForm").reset();
  editAddressIndex = -1;
  document.getElementById("addressFormTitle").innerHTML = "Add New Address";
  document.getElementById("addressSaveButton").value = "Save Address";
  clearErrors(addressFields);
}


// Connect this part's form and search box (addEventListener)
document.getElementById("addressForm").addEventListener("submit", function (event) {
  event.preventDefault();
  saveAddress();
});
document.querySelector("#addressForm .btn-secondary").addEventListener("click", resetAddressForm);
document.getElementById("addressSearch").addEventListener("keyup", renderAddresses);
document.getElementById("addressLabelFilter").addEventListener("change", renderAddresses);


/* =====================================================================
   2. CART AND CHECKOUT  (unique feature 1)
   ===================================================================== */

// The product list on the left with an "Add" button
function renderShop() {
  let keyword = document.getElementById("shopSearch").value;
  let category = document.getElementById("shopCategory").value;
  let rows = "";

  for (const product of products) {
    let matches = (containsText(product.name, keyword) || containsText(product.district, keyword)) &&
      (category === "All" || product.category === category);
    if (matches) {
      let button = (product.stock > 0)
        ? "<button type='button' class='btn btn-small' onclick=\"addToCart('" + product.id + "')\">Add</button>"
        : "<span class='badge red'>Sold out</span>";
      rows += "<tr>" +
        "<td>" + thumbHtml(product) + "<strong>" + product.name + "</strong><br><span class='hint'>" + product.district + "</span></td>" +
        "<td>Tk " + product.price + " / " + product.unit + "</td>" +
        "<td>" + product.stock + "</td>" +
        "<td>" + button + "</td>" +
        "</tr>";
    }
  }
  if (rows === "") {
    rows = "<tr><td colspan='4' class='empty-row'>No products found.</td></tr>";
  }
  document.getElementById("shopBody").innerHTML = rows;
}

// Finds the position of a product inside the cart, or -1
function findInCart(productId) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      return i;
    }
  }
  return -1;
}

function addToCart(productId) {
  let product = findProduct(productId);
  let index = findInCart(productId);

  if (product == null || product.stock === 0) {
    showMessage("cartMessage", "Sorry, this product is out of stock.", "error");
    return;
  }

  if (index === -1) {
    cart.push({ productId: productId, qty: 1 });
  } else if (cart[index].qty < product.stock) {
    cart[index].qty++;
  } else {
    showMessage("cartMessage", "Only " + product.stock + " " + product.unit + " of " + product.name + " in stock.", "error");
    return;
  }
  showMessage("cartMessage", product.name + " added to your cart.", "success");
  refreshCustomerPage();
}

// The cart table; each quantity box calls changeQty() when it changes
function renderCart() {
  let rows = "";
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    let product = findProduct(cart[i].productId);
    let lineTotal = product.price * cart[i].qty;
    total += lineTotal;

    rows += "<tr>" +
      "<td>" + product.name + "</td>" +
      "<td>Tk " + product.price + "</td>" +
      "<td><input type='number' class='qty-input' min='1' max='" + product.stock + "' value='" + cart[i].qty + "' onchange='changeQty(" + i + ", this.value)'></td>" +
      "<td>" + formatTaka(lineTotal) + "</td>" +
      "<td><button type='button' class='btn btn-small btn-danger' onclick='removeFromCart(" + i + ")'>Remove</button></td>" +
      "</tr>";
  }

  if (cart.length === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>Your cart is empty.</td></tr>";
  }
  document.getElementById("cartBody").innerHTML = rows;
  document.getElementById("cartTotal").innerHTML = formatTaka(total);
}

function changeQty(index, value) {
  let product = findProduct(cart[index].productId);
  let qty = Math.floor(Number(value));      // whole units only

  if (isNaN(qty) || qty < 1) {
    qty = 1;
  }
  if (qty > product.stock) {
    qty = product.stock;
    showMessage("cartMessage", "Only " + product.stock + " " + product.unit + " of " + product.name + " in stock.", "error");
  }
  cart[index].qty = qty;
  refreshCustomerPage();
}

function removeFromCart(index) {
  cart = removeAt(cart, index);
  refreshCustomerPage();
}

// The "Deliver to" drop-down is built from my addresses with createElement
function fillCheckoutAddresses() {
  let select = document.getElementById("checkoutAddress");
  let chosen = select.value;
  select.innerHTML = "<option value=''>-- Select address --</option>";

  for (const address of addresses) {
    if (address.customerId === currentCustomerId) {
      let option = document.createElement("option");
      option.value = address.id;
      option.innerHTML = address.label + ": " + address.details;
      select.appendChild(option);
    }
  }
  select.value = chosen;
}

function placeOrder() {
  let addressId = document.getElementById("checkoutAddress").value;
  let payment = getRadioValue("checkoutPayment");
  clearError("checkoutAddress");

  if (cart.length === 0) {
    showMessage("cartMessage", "Your cart is empty. Add a product first.", "error");
    return false;
  }
  if (addressId === "") {
    showError("checkoutAddress", "Please choose where to deliver.");
    return false;
  }

  // Check the stock again before anything is taken out
  for (const line of cart) {
    let product = findProduct(line.productId);
    if (product == null || line.qty > product.stock) {
      let name = (product == null) ? "A product" : product.name;
      let left = (product == null) ? 0 : product.stock;
      showMessage("cartMessage", name + " has only " + left + " in stock. Please change the quantity.", "error");
      return false;
    }
  }

  // Build the list of items and take them out of stock
  let items = [];
  let total = 0;
  for (const line of cart) {
    let product = findProduct(line.productId);
    items.push({ productId: product.id, name: product.name, price: product.price, qty: line.qty });
    product.stock = product.stock - line.qty;
    total += product.price * line.qty;
  }

  let address = addresses[findIndexById(addresses, addressId)];
  let customer = findUser(currentCustomerId);
  let newOrder = {
    id: nextId("AM", orders),
    customerId: currentCustomerId,
    customerName: address.recipient,
    phone: address.phone,
    area: address.area,
    address: address.details,
    deliveryId: currentDeliveryId,           // the admin will assign one later (backend)
    payment: payment,
    paid: (payment !== "Cash on Delivery"),
    status: "Placed",
    date: todayString(),
    items: items
  };
  orders.push(newOrder);
  cart = [];                                   // empty the cart

  showMessage("cartMessage", "Thank you, " + customer.name + "! Order <strong>#" + newOrder.id + "</strong> was placed. Total " +
    formatTaka(total) + " by " + payment + ". You can follow it in Order Tracking.", "success");
  document.getElementById("checkoutForm").reset();
  refreshCustomerPage();
  document.getElementById("trackOrder").value = newOrder.id;
  renderTracking();
  return false;
}


// Connect this part's form and search box (addEventListener)
document.getElementById("shopSearch").addEventListener("keyup", renderShop);
document.getElementById("shopCategory").addEventListener("change", renderShop);
document.getElementById("checkoutForm").addEventListener("submit", function (event) {
  event.preventDefault();
  placeOrder();
});

/* #####################################################################
   Price Drop Alerts + Back-in-Stock Alerts
   ##################################################################### */


/* =====================================================================
   3. PRICE DROP ALERTS
   ===================================================================== */
function fillAlertProducts() {
  let select = document.getElementById("priceAlertProduct");
  select.innerHTML = "<option value=''>-- Select product --</option>";
  for (const product of products) {
    let option = document.createElement("option");
    option.value = product.id;
    option.innerHTML = product.name + " (Tk " + product.price + " / " + product.unit + ")";
    select.appendChild(option);
  }
}

function renderPriceAlerts() {
  let rows = "";
  let count = 0;

  for (let i = 0; i < priceAlerts.length; i++) {
    let alert = priceAlerts[i];
    if (alert.customerId !== currentCustomerId) {
      continue;
    }
    let product = findProduct(alert.productId);
    let status;
    let buttons;

    if (product.price <= alert.target) {
      status = "<span class='badge green'>Price dropped</span>";
      buttons = "<button type='button' class='btn btn-small' onclick=\"addToCart('" + product.id + "')\">Add to Cart</button>";
    } else {
      status = "<span class='badge blue'>Watching</span>";
      buttons = "<button type='button' class='btn btn-small' onclick='editPriceAlert(" + i + ")'>Edit</button>";
    }
    buttons += "<button type='button' class='btn btn-small btn-danger' onclick='deletePriceAlert(" + i + ")'>Delete</button>";

    rows += "<tr>" +
      "<td><strong>" + product.name + "</strong><br><span class='hint'>" + product.district + "</span></td>" +
      "<td>Tk " + product.price + " / " + product.unit + "</td>" +
      "<td>Tk " + alert.target + "</td>" +
      "<td>" + status + "</td>" +
      "<td>" + buttons + "</td>" +
      "</tr>";
    count++;
  }

  if (count === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>No price alerts yet.</td></tr>";
  }
  document.getElementById("priceAlertBody").innerHTML = rows;
  document.getElementById("priceAlertCount").innerHTML = count + " alert(s)";

  // Notifications: newest first
  let html = "";
  for (const note of priceNotifications) {
    html += "<div class='review'>" + note.text + "<br><span class='hint'>" + note.time + " · " + note.via + "</span></div>";
  }
  document.getElementById("priceAlertNotifications").innerHTML = (html === "") ? "<p class='hint'>No notifications yet.</p>" : html;
}

function savePriceAlert() {
  let productId = document.getElementById("priceAlertProduct").value;
  let target = document.getElementById("priceAlertTarget").value;

  // The ticked checkboxes go into an array with push()
  let notifyBy = [];
  if (document.getElementById("priceNotifyApp").checked) { notifyBy.push("In-app"); }
  if (document.getElementById("priceNotifySms").checked) { notifyBy.push("SMS"); }
  if (document.getElementById("priceNotifyEmail").checked) { notifyBy.push("Email"); }

  let isValid = true;
  clearErrors(["priceAlertProduct", "priceAlertTarget"]);

  if (productId === "") {
    showError("priceAlertProduct", "Please choose a product.");
    isValid = false;
  }
  if (target === "" || Number(target) < 1) {
    showError("priceAlertTarget", "Please enter a target price.");
    isValid = false;
  } else if (productId !== "" && Number(target) >= findProduct(productId).price) {
    showError("priceAlertTarget", "The target must be lower than today's price (Tk " + findProduct(productId).price + ").");
    isValid = false;
  }
  if (notifyBy.length === 0) {
    showMessage("priceAlertMessage", "Tick at least one way to notify you.", "error");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  let product = findProduct(productId);
  if (editPriceAlertIndex === -1) {
    priceAlerts.push({
      id: nextId("PA", priceAlerts), customerId: currentCustomerId, productId: productId,
      target: Number(target), notifyBy: notifyBy
    });
    showMessage("priceAlertMessage", "We will tell you by " + notifyBy.join(", ") + " when " + product.name +
      " is Tk " + target + " or less.", "success");
  } else {
    let alert = priceAlerts[editPriceAlertIndex];
    alert.productId = productId;
    alert.target = Number(target);
    alert.notifyBy = notifyBy;
    showMessage("priceAlertMessage", "Alert for " + product.name + " updated.", "success");
  }

  resetPriceAlertForm();
  refreshCustomerPage();
  return false;
}

function editPriceAlert(index) {
  let alert = priceAlerts[index];
  editPriceAlertIndex = index;
  document.getElementById("priceAlertProduct").value = alert.productId;
  document.getElementById("priceAlertTarget").value = alert.target;
  document.getElementById("priceNotifyApp").checked = (alert.notifyBy.indexOf("In-app") !== -1);
  document.getElementById("priceNotifySms").checked = (alert.notifyBy.indexOf("SMS") !== -1);
  document.getElementById("priceNotifyEmail").checked = (alert.notifyBy.indexOf("Email") !== -1);
  document.querySelector("#priceAlertForm input[type='submit']").value = "Update Alert";
}

function deletePriceAlert(index) {
  priceAlerts = removeAt(priceAlerts, index);
  showMessage("priceAlertMessage", "Price alert deleted.", "info");
  resetPriceAlertForm();
  refreshCustomerPage();
}

function resetPriceAlertForm() {
  document.getElementById("priceAlertForm").reset();
  editPriceAlertIndex = -1;
  document.querySelector("#priceAlertForm input[type='submit']").value = "Save Alert";
}


// Connect this part's form and search box (addEventListener)
document.getElementById("priceAlertForm").addEventListener("submit", function (event) {
  event.preventDefault();
  savePriceAlert();
});


/* =====================================================================
   4. BACK-IN-STOCK ALERTS
   ===================================================================== */

// true when I already follow this product
function findStockAlert(productId) {
  for (let i = 0; i < stockAlerts.length; i++) {
    if (stockAlerts[i].customerId === currentCustomerId && stockAlerts[i].productId === productId) {
      return i;
    }
  }
  return -1;
}

function renderStockAlerts() {
  // Left: products that are out of stock now
  let rows = "";
  for (const product of outOfStockProducts) {
    let button = (findStockAlert(product.id) === -1)
      ? "<button type='button' class='btn btn-small' onclick=\"followProduct('" + product.id + "')\">Notify Me</button>"
      : "<button type='button' class='btn btn-small btn-secondary' onclick=\"unfollowProduct('" + product.id + "')\">Following</button>";
    rows += "<tr>" +
      "<td><strong>" + product.name + "</strong><br><span class='hint'>" + product.district + "</span></td>" +
      "<td>Tk " + product.price + " / " + product.unit + "</td>" +
      "<td><span class='badge red'>" + product.stock + "</span></td>" +
      "<td>" + button + "</td>" +
      "</tr>";
  }
  document.getElementById("outOfStockBody").innerHTML = rows;

  // Right: my alerts with the current status
  let alertRows = "";
  let count = 0;
  for (let i = 0; i < stockAlerts.length; i++) {
    let alert = stockAlerts[i];
    if (alert.customerId !== currentCustomerId) {
      continue;
    }
    let product = findProduct(alert.productId);
    let status;
    let buttons = "";
    if (product.stock > 0) {
      status = "<span class='badge green'>Back in stock (" + product.stock + ")</span>";
      buttons = "<button type='button' class='btn btn-small' onclick=\"addToCart('" + product.id + "')\">Add to Cart</button>";
    } else {
      status = "<span class='badge red'>Out of stock</span>";
    }
    buttons += "<button type='button' class='btn btn-small btn-danger' onclick='removeStockAlert(" + i + ")'>Remove</button>";

    alertRows += "<tr>" +
      "<td><strong>" + product.name + "</strong><br><span class='hint'>" + product.district + "</span></td>" +
      "<td>" + status + "</td>" +
      "<td>" + alert.date + "</td>" +
      "<td>" + buttons + "</td>" +
      "</tr>";
    count++;
  }
  if (count === 0) {
    alertRows = "<tr><td colspan='4' class='empty-row'>You are not following any product.</td></tr>";
  }
  document.getElementById("stockAlertBody").innerHTML = alertRows;
  document.getElementById("stockAlertCount").innerHTML = count + " alert(s)";

  let html = "";
  for (const note of stockNotifications) {
    html += "<div class='review'>" + note.text + "<br><span class='hint'>" + note.time + " · " + note.via + "</span></div>";
  }
  document.getElementById("stockAlertNotifications").innerHTML = (html === "") ? "<p class='hint'>No notifications yet.</p>" : html;
}

function followProduct(productId) {
  stockAlerts.push({ id: nextId("SA", stockAlerts), customerId: currentCustomerId, productId: productId, date: todayString() });
  showMessage("stockAlertMessage", "We will notify you when " + findProduct(productId).name + " is back in stock.", "success");
  refreshCustomerPage();
}

function unfollowProduct(productId) {
  removeStockAlert(findStockAlert(productId));
}

function removeStockAlert(index) {
  let product = findProduct(stockAlerts[index].productId);
  stockAlerts = removeAt(stockAlerts, index);
  showMessage("stockAlertMessage", "Stopped following " + product.name + ".", "info");
  refreshCustomerPage();
}


/* =====================================================================
   5. ORDER TRACKING  (unique feature 2)
   ===================================================================== */
function fillTrackOrders() {
  let select = document.getElementById("trackOrder");
  let chosen = select.value;
  select.innerHTML = "";

  // Newest order first: loop the array backwards
  for (let i = orders.length - 1; i >= 0; i--) {
    if (orders[i].customerId === currentCustomerId) {
      let option = document.createElement("option");
      option.value = orders[i].id;
      option.innerHTML = "#" + orders[i].id + " (" + orders[i].status + ")";
      select.appendChild(option);
    }
  }
  if (chosen !== "") {
    select.value = chosen;
  }
}

function renderTracking() {
  let orderId = document.getElementById("trackOrder").value;
  let index = findIndexById(orders, orderId);
  if (index === -1) {
    document.getElementById("trackInfo").innerHTML = "You have no orders yet.";
    document.getElementById("trackSteps").innerHTML = "";
    document.getElementById("trackItems").innerHTML = "";
    return;
  }
  let order = orders[index];

  // Every step up to the current one gets the "done" class
  let reached = orderSteps.indexOf(order.status);
  let steps = "";
  for (let i = 0; i < orderSteps.length; i++) {
    steps += "<div class='" + (i <= reached ? "track-step done" : "track-step") + "'>" + orderSteps[i] + "</div>";
  }
  document.getElementById("trackSteps").innerHTML = steps;

  let rows = "";
  let total = 0;
  for (const item of order.items) {
    rows += "<tr><td>" + item.name + "</td><td>" + item.qty + "</td><td>" + formatTaka(item.price * item.qty) + "</td></tr>";
    total += item.price * item.qty;
  }
  document.getElementById("trackItems").innerHTML = rows;

  let paidText = order.paid ? "(paid)" : "(to pay)";
  let driver = findUser(order.deliveryId);
  let driverText = (driver == null) ? "Not assigned yet" : driver.name + " (" + driver.phone + ")";
  document.getElementById("trackInfo").innerHTML =
    "<strong>Total:</strong> " + formatTaka(total) + " · " + order.payment + " " + paidText + "<br>" +
    "<strong>Deliver to:</strong> " + order.address + "<br>" +
    "<strong>Delivery person:</strong> " + driverText;
}


// Connect this part's form and search box (addEventListener)
document.getElementById("trackOrder").addEventListener("change", renderTracking);

/* =====================================================================
   6. REVIEW AND RATING  (unique feature 3)
   ===================================================================== */

// Only products from my DELIVERED orders that I have not reviewed yet
function fillReviewProducts() {
  let select = document.getElementById("reviewProduct");
  select.innerHTML = "<option value=''>-- Select product --</option>";
  let added = [];                        // ids already in the list

  for (const order of orders) {
    if (order.customerId === currentCustomerId && order.status === "Delivered") {
      for (const item of order.items) {
        if (added.indexOf(item.productId) === -1 && hasReviewed(item.productId) === false) {
          let option = document.createElement("option");
          option.value = item.productId;
          option.innerHTML = item.name;
          select.appendChild(option);
          added.push(item.productId);
        }
      }
    }
  }
}

function hasReviewed(productId) {
  for (const review of reviews) {
    if (review.customerId === currentCustomerId && review.productId === productId) {
      return true;
    }
  }
  return false;
}

// 4 -> "★★★★☆" made with a loop
function starText(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += (i <= rating) ? "★" : "☆";
  }
  return stars;
}

function renderReviews() {
  let html = "";
  let sum = 0;
  for (let i = reviews.length - 1; i >= 0; i--) {
    let review = reviews[i];
    html += "<div class='review'><strong>" + review.product + "</strong> <span class='stars'>" + starText(review.rating) + "</span><br>" +
      review.comment + "<br><span class='hint'>" + review.customer + " · " + review.date + "</span></div>";
    sum += review.rating;
  }
  if (reviews.length === 0) {
    html = "<p class='hint'>No reviews yet.</p>";
  }
  document.getElementById("reviewList").innerHTML = html;

  // Average rounded to one decimal place
  let average = (reviews.length === 0) ? 0 : Math.round(sum / reviews.length * 10) / 10;
  document.getElementById("reviewAverage").innerHTML = average + " / 5";
}

function submitReview() {
  let productId = document.getElementById("reviewProduct").value;
  let rating = Number(document.getElementById("reviewRating").value);
  let comment = document.getElementById("reviewComment").value.trim();

  let isValid = true;
  clearErrors(["reviewProduct", "reviewComment"]);

  if (productId === "") {
    showError("reviewProduct", "Please choose a product you received.");
    isValid = false;
  }
  if (comment.length < 5) {
    showError("reviewComment", "Please write at least 5 characters.");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  let product = findProduct(productId);
  reviews.push({
    productId: productId, product: product.name, customerId: currentCustomerId,
    customer: findUser(currentCustomerId).name, rating: rating, comment: comment, date: todayString()
  });

  showMessage("reviewMessage", "Thank you! Your " + rating + "-star review of " + product.name + " was posted.", "success");
  document.getElementById("reviewForm").reset();
  refreshCustomerPage();
  return false;
}


// Connect this part's form and search box (addEventListener)
document.getElementById("reviewForm").addEventListener("submit", function (event) {
  event.preventDefault();
  submitReview();
});


/* =====================================================================
   REDRAW EVERYTHING THAT DEPENDS ON THE DATA
   ===================================================================== */
function refreshCustomerPage() {
  updateCustomerStats();
  renderAddresses();
  fillCheckoutAddresses();
  renderShop();
  renderCart();
  renderPriceAlerts();
  renderStockAlerts();
  fillTrackOrders();
  renderTracking();
  fillReviewProducts();
  renderReviews();
}


// Start
fillAlertProducts();
refreshCustomerPage();
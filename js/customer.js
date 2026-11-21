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
  let qty = Number(value);

  if (qty < 1) {
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
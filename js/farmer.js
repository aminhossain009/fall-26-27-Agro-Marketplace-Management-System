/* =====================================================================
   farmer.js  -  Farmer dashboard (farmer.html)
   Part: Mim  |  Push 7 and Push 8 (2 parts below)
   ---------------------------------------------------------------------
   CRUD + Search : My Products (name, category, price, unit, stock)
   Unique 1      : Crop Planner - harvest date = sowing date + crop days
   Unique 2      : Earnings and Payout Request - bKash / Nagad
   Unique 3      : Price Guide - my price compared with today's market price
   Also          : Market Products (read-only search, in common.js)
   ===================================================================== */


/* #####################################################################
   PART 1  -  Mim  -  Push 7
   Statistic tiles + My Products (CRUD + Search)
   ##################################################################### */


let editProductIndex = -1;      // -1 = adding a new product, otherwise the index being edited
const productFields = ["productName", "productCategory", "productPrice", "productStock"];


/* =====================================================================
   STATISTIC TILES AT THE TOP
   ===================================================================== */
function updateFarmerStats() {
  let myProducts = 0;
  for (const product of products) {
    if (product.farmerId === currentFarmerId) {
      myProducts++;
    }
  }

  // Open orders = not delivered yet and holding at least one of my products
  let openOrders = 0;
  for (const order of orders) {
    if (order.status !== "Delivered") {
      let hasMine = false;
      for (const item of order.items) {
        let product = findProduct(item.productId);
        if (product != null && product.farmerId === currentFarmerId) {
          hasMine = true;
        }
      }
      if (hasMine) {
        openOrders++;
      }
    }
  }

  let plans = 0;
  for (const plan of cropPlans) {
    if (plan.farmerId === currentFarmerId) {
      plans++;
    }
  }

  document.getElementById("statProducts").innerHTML = myProducts;
  document.getElementById("statOrders").innerHTML = openOrders;
  document.getElementById("statBalance").innerHTML = formatTaka(farmerWallet.balance);
  document.getElementById("statPlans").innerHTML = plans;
}


/* =====================================================================
   1. MY PRODUCTS  (CRUD + SEARCH)
   ===================================================================== */

// READ + SEARCH: redraw the table from the products array
function renderProducts() {
  let keyword = document.getElementById("productSearch").value;
  let category = document.getElementById("productCategoryFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < products.length; i++) {
    let product = products[i];
    if (product.farmerId !== currentFarmerId) {
      continue;                               // only MY products
    }
    let matchesKeyword = containsText(product.name, keyword) || containsText(product.id, keyword);
    let matchesCategory = (category === "All" || product.category === category);

    if (matchesKeyword && matchesCategory) {
      let stock;
      if (product.stock === 0) {
        stock = "<span class='badge red'>Out of stock</span>";
      } else if (product.stock <= lowStockLimit) {
        stock = "<span class='badge orange'>" + product.stock + " left</span>";
      } else {
        stock = "<span class='badge green'>" + product.stock + " in stock</span>";
      }

      rows += "<tr>" +
                "<td>" + product.id + "</td>" +
                "<td>" + thumbHtml(product) + "<strong>" + product.name + "</strong><br><span class='hint'>" + product.description + "</span></td>" +
                "<td>" + product.category + "</td>" +
                "<td>Tk " + product.price + " / " + product.unit + "</td>" +
                "<td>" + stock + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editProduct(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteProduct(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No products found.</td></tr>";
  }

  document.getElementById("productBody").innerHTML = rows;
  document.getElementById("productCount").innerHTML = shown + " product(s)";
}

// The market price whose name is inside the product name,
// e.g. "Fresh Potatoes" -> "Potatoes" (or "" when none matches)
function matchRateName(productName) {
  for (const rate of marketRates) {
    if (containsText(productName, rate.name)) {
      return rate.name;
    }
  }
  return "";
}

// CREATE + UPDATE: the form's submit
function saveProduct() {
  let name = document.getElementById("productName").value.trim();
  let category = document.getElementById("productCategory").value;
  let price = document.getElementById("productPrice").value;
  let unit = document.getElementById("productUnit").value;
  let stock = document.getElementById("productStock").value;
  let description = document.getElementById("productDescription").value.trim();

  let isValid = true;
  clearErrors(productFields);

  if (name.length < 3) {
    showError("productName", "Product name must be at least 3 characters.");
    isValid = false;
  }
  if (category === "") {
    showError("productCategory", "Please choose a category.");
    isValid = false;
  }
  if (price === "" || Number(price) < 1) {
    showError("productPrice", "Price must be at least Tk 1.");
    isValid = false;
  }
  if (stock === "" || Number(stock) < 0) {
    showError("productStock", "Stock cannot be empty or below 0.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editProductIndex === -1) {
    // CREATE: a new object is pushed into the array
    let newProduct = {
      id: nextId("P", products.concat(outOfStockProducts)),
      name: name,
      farmerId: currentFarmerId,
      farmer: findUser(currentFarmerId).name,
      district: findUser(currentFarmerId).district,
      category: category,
      price: Number(price),
      unit: unit,
      stock: Number(stock),
      image: "",
      rateName: matchRateName(name),
      description: (description === "") ? "No description yet." : description
    };
    products.push(newProduct);
    showMessage("productMessage", "Product <strong>" + name + "</strong> was added (" + newProduct.id + ").", "success");
  } else {
    // UPDATE: change the properties of the object that is being edited
    let product = products[editProductIndex];
    product.name = name;
    if (product.rateName === "" || product.rateName == null) {
      product.rateName = matchRateName(name);
    }
    product.category = category;
    product.price = Number(price);
    product.unit = unit;
    product.stock = Number(stock);
    product.description = (description === "") ? "No description yet." : description;
    showMessage("productMessage", "Product <strong>" + name + "</strong> was updated.", "success");
  }

  resetProductForm();
  refreshFarmerPage();
  return false;
}

// UPDATE step 1: copy the object into the form
function editProduct(index) {
  let product = products[index];
  editProductIndex = index;

  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productUnit").value = product.unit;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productDescription").value = product.description;

  document.getElementById("productFormTitle").innerHTML = "Edit Product " + product.id;
  document.getElementById("productSaveButton").value = "Update Product";
  clearErrors(productFields);
}

// DELETE
function deleteProduct(index) {
  let product = products[index];
  if (confirm("Delete " + product.name + "?") === false) {
    return;
  }
  products = removeAt(products, index);
  showMessage("productMessage", "Product <strong>" + product.name + "</strong> was deleted.", "info");
  resetProductForm();
  refreshFarmerPage();
}

function resetProductForm() {
  document.getElementById("productForm").reset();
  editProductIndex = -1;
  document.getElementById("productFormTitle").innerHTML = "Add New Product";
  document.getElementById("productSaveButton").value = "Add Product";
  clearErrors(productFields);
}


// Connect this part's form and search box (addEventListener)
document.getElementById("productForm").addEventListener("submit", function (event) {
  event.preventDefault();
  saveProduct();
});
document.querySelector("#productForm .btn-secondary").addEventListener("click", resetProductForm);
document.getElementById("productSearch").addEventListener("keyup", renderProducts);
document.getElementById("productCategoryFilter").addEventListener("change", renderProducts);


/* #####################################################################
   PART 2  -  Mim  -  Push 8
   Crop Planner + Payout + Price Guide + start the page
   ##################################################################### */


/* =====================================================================
   2. CROP PLANNER  (unique feature 1)
   ===================================================================== */

// Builds the crop drop-down with createElement + appendChild (Week 06)
function fillCropList() {
  let select = document.getElementById("cropName");
  select.innerHTML = "<option value=''>-- Select --</option>";
  for (const crop of cropTypes) {
    let option = document.createElement("option");
    option.value = crop.name;
    option.innerHTML = crop.name + " (" + crop.days + " days)";
    select.appendChild(option);
  }
}

function getCropDays(cropName) {
  for (const crop of cropTypes) {
    if (crop.name === cropName) {
      return crop.days;
    }
  }
  return 0;
}

function renderCropPlans() {
  let rows = "";
  let totalLand = 0;
  let today = todayString();

  for (let i = 0; i < cropPlans.length; i++) {
    let plan = cropPlans[i];
    if (plan.farmerId !== currentFarmerId) {
      continue;
    }
    let harvest = addDays(plan.sowDate, getCropDays(plan.crop));
    let stage;

    if (daysBetween(today, plan.sowDate) > 0) {
      stage = "<span class='badge grey'>Planned</span>";
    } else if (daysBetween(today, harvest) > 0) {
      stage = "<span class='badge blue'>Growing, " + daysBetween(today, harvest) + " days left</span>";
    } else {
      stage = "<span class='badge green'>Ready to harvest</span>";
    }

    rows += "<tr>" +
              "<td><strong>" + plan.crop + "</strong></td>" +
              "<td>" + plan.land + " bigha</td>" +
              "<td>" + plan.sowDate + "</td>" +
              "<td>" + harvest + "</td>" +
              "<td>" + stage + "</td>" +
              "<td><button type='button' class='btn btn-small btn-danger' onclick='removeCropPlan(" + i + ")'>Remove</button></td>" +
            "</tr>";
    totalLand += plan.land;
  }

  if (rows === "") {
    rows = "<tr><td colspan='6' class='empty-row'>No crop plans yet.</td></tr>";
  }
  document.getElementById("cropBody").innerHTML = rows;
  document.getElementById("cropTotal").innerHTML = "Total land planned: " + totalLand + " bigha";
}

function addCropPlan() {
  let crop = document.getElementById("cropName").value;
  let land = document.getElementById("cropLand").value;
  let sowDate = document.getElementById("cropDate").value;

  let isValid = true;
  clearErrors(["cropName", "cropLand", "cropDate"]);

  if (crop === "") {
    showError("cropName", "Please choose a crop.");
    isValid = false;
  }
  if (land === "" || Number(land) < 1) {
    showError("cropLand", "Land must be at least 1 bigha.");
    isValid = false;
  }
  if (sowDate === "") {
    showError("cropDate", "Please choose the sowing date.");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  cropPlans.push({ id: nextId("C", cropPlans), farmerId: currentFarmerId, crop: crop, land: Number(land), sowDate: sowDate });

  let harvest = addDays(sowDate, getCropDays(crop));
  showMessage("cropMessage", "Plan added: <strong>" + crop + "</strong> on " + land + " bigha. Expected harvest: <strong>" + harvest + "</strong>.", "success");
  document.getElementById("cropForm").reset();
  refreshFarmerPage();
  return false;
}

function removeCropPlan(index) {
  let plan = cropPlans[index];
  cropPlans = removeAt(cropPlans, index);
  showMessage("cropMessage", "Removed the plan for " + plan.crop + ".", "info");
  refreshFarmerPage();
}


// Connect this part's form and search box (addEventListener)
document.getElementById("cropForm").addEventListener("submit", function (event) {
  event.preventDefault();
  addCropPlan();
});


/* =====================================================================
   3. EARNINGS AND PAYOUT REQUEST  (unique feature 2)
   ===================================================================== */
function renderPayouts() {
  document.getElementById("payoutBalance").innerHTML = formatTaka(farmerWallet.balance);
  document.getElementById("payoutPaid").innerHTML = formatTaka(farmerWallet.paidOut) + " paid out so far";

  let rows = "";
  for (const payout of payouts) {
    if (payout.farmerId === currentFarmerId) {
      rows += "<tr>" +
                "<td>" + payout.id + "</td>" +
                "<td>" + payout.date + "</td>" +
                "<td>" + payout.method + " " + payout.number + "</td>" +
                "<td>" + formatTaka(payout.amount) + "</td>" +
                "<td>" + statusBadge(payout.status) + "</td>" +
              "</tr>";
    }
  }
  if (rows === "") {
    rows = "<tr><td colspan='5' class='empty-row'>No payouts yet.</td></tr>";
  }
  document.getElementById("payoutBody").innerHTML = rows;
}

function requestPayout() {
  let method = getRadioValue("payMethod");
  let number = document.getElementById("payNumber").value.trim();
  let amount = document.getElementById("payAmount").value;

  let isValid = true;
  clearErrors(["payNumber", "payAmount"]);

  if (isValidMobile(number) === false) {
    showError("payNumber", "Mobile must be 11 digits and start with 01.");
    isValid = false;
  }
  if (amount === "" || Number(amount) < 100) {
    showError("payAmount", "The smallest payout is Tk 100.");
    isValid = false;
  } else if (Number(amount) > farmerWallet.balance) {
    showError("payAmount", "You only have " + formatTaka(farmerWallet.balance) + ".");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  // unshift() puts the newest payout at the top of the list
  payouts.unshift({ id: nextId("W", payouts), farmerId: currentFarmerId, date: todayString(),
                    method: method, number: number, amount: Number(amount), status: "Pending" });
  farmerWallet.balance = farmerWallet.balance - Number(amount);

  showMessage("payoutMessage", "Request sent: " + formatTaka(amount) + " to " + method + " " + number +
              ". It will be paid within 24 hours.", "success");
  document.getElementById("payForm").reset();
  refreshFarmerPage();
  return false;
}


// Connect this part's form and search box (addEventListener)
document.getElementById("payForm").addEventListener("submit", function (event) {
  event.preventDefault();
  requestPayout();
});


/* =====================================================================
   4. PRICE GUIDE  (unique feature 3)
   ===================================================================== */
function findRate(rateName) {
  for (const rate of marketRates) {
    if (rate.name === rateName) {
      return rate;
    }
  }
  return null;
}

function renderPriceGuide() {
  let rows = "";

  for (let i = 0; i < products.length; i++) {
    let product = products[i];
    if (product.farmerId !== currentFarmerId) {
      continue;
    }
    let rate = findRate(product.rateName);
    let market = "No market price yet";
    let comment = "<span class='badge grey'>No data</span>";
    let button = "";

    if (rate != null) {
      market = "Tk " + rate.min + " - " + rate.max;
      if (product.price > rate.max) {
        comment = "<span class='badge red'>Price too high</span>";
        button = "<button type='button' class='btn btn-small' onclick='useFairPrice(" + i + ")'>Use fair price</button>";
      } else if (product.price < rate.min) {
        comment = "<span class='badge orange'>Price too low</span>";
        button = "<button type='button' class='btn btn-small' onclick='useFairPrice(" + i + ")'>Use fair price</button>";
      } else {
        comment = "<span class='badge green'>Fair</span>";
      }
    }

    rows += "<tr>" +
              "<td><strong>" + product.name + "</strong></td>" +
              "<td>" + market + "</td>" +
              "<td>Tk " + product.price + "</td>" +
              "<td>" + comment + "</td>" +
              "<td>" + button + "</td>" +
            "</tr>";
  }

  if (rows === "") {
    rows = "<tr><td colspan='5' class='empty-row'>Add a product to compare prices.</td></tr>";
  }
  document.getElementById("guideBody").innerHTML = rows;
}

// Too high -> the market maximum, too low -> the market minimum
function useFairPrice(index) {
  let product = products[index];
  let rate = findRate(product.rateName);
  let oldPrice = product.price;

  product.price = (product.price > rate.max) ? rate.max : rate.min;

  showMessage("guideMessage", product.name + ": price changed from Tk " + oldPrice + " to Tk " + product.price + ".", "success");
  refreshFarmerPage();
}


/* =====================================================================
   REDRAW EVERYTHING THAT DEPENDS ON THE DATA
   ===================================================================== */
function refreshFarmerPage() {
  updateFarmerStats();
  renderProducts();
  renderCropPlans();
  renderPayouts();
  renderPriceGuide();
  renderCatalog();          // common.js - the market list shows my changes too
}


// Start
fillCropList();
refreshFarmerPage();

// fixed bugs in js css

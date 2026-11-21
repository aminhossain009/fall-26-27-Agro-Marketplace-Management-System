// delivery.js - Delivery dashboard (Amin)
// Part 1: stat tiles + Trip Log (CRUD + search)

let editTripIndex = -1;
const tripFields = ["tripDate", "tripArea", "tripDistance", "tripFuel"];


// Stat tiles
function updateDeliveryStats() {
  let assigned = 0;
  let remaining = 0;
  for (const order of orders) {
    if (order.deliveryId === currentDeliveryId) {
      assigned++;
      if (order.status !== "Delivered") {
        remaining++;
      }
    }
  }
  let myTrips = 0;
  for (const trip of trips) {
    if (trip.deliveryId === currentDeliveryId) {
      myTrips++;
    }
  }

  document.getElementById("statAssigned").innerHTML = assigned;
  document.getElementById("statRemaining").innerHTML = remaining;
  document.getElementById("statToday").innerHTML = formatTaka(getDeliveriesOn(todayString()) * earningPerDelivery);
  document.getElementById("statTrips").innerHTML = myTrips;
}


// Trip log: show + search
function renderTrips() {
  let keyword = document.getElementById("tripSearch").value;
  let vehicle = document.getElementById("tripVehicleFilter").value;

  let rows = "";
  let shown = 0;
  let totalKm = 0;
  let totalFuel = 0;

  for (let i = 0; i < trips.length; i++) {
    let trip = trips[i];
    if (trip.deliveryId !== currentDeliveryId) {
      continue;
    }
    let matchesKeyword = containsText(trip.area, keyword) || containsText(trip.note, keyword) ||
                         containsText(trip.date, keyword) || containsText(trip.id, keyword);
    let matchesVehicle = (vehicle === "All" || trip.vehicle === vehicle);

    if (matchesKeyword && matchesVehicle) {
      let note = (trip.note === "") ? "" : "<br><span class='hint'>" + trip.note + "</span>";
      rows += "<tr>" +
                "<td>" + trip.id + "</td>" +
                "<td>" + trip.date + "</td>" +
                "<td><strong>" + trip.area + "</strong>" + note + "</td>" +
                "<td>" + trip.vehicle + "</td>" +
                "<td>" + trip.distance + " km</td>" +
                "<td>" + formatTaka(trip.fuel) + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editTrip(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteTrip(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
      totalKm += trip.distance;
      totalFuel += trip.fuel;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No trips found.</td></tr>";
  }
  document.getElementById("tripBody").innerHTML = rows;
  document.getElementById("tripCount").innerHTML = shown + " trip(s), " + totalKm + " km, " + formatTaka(totalFuel) + " fuel";
}

// Add or update a trip
function saveTrip() {
  let date = document.getElementById("tripDate").value;
  let area = document.getElementById("tripArea").value.trim();
  let vehicle = getRadioValue("tripVehicle");
  let distance = document.getElementById("tripDistance").value;
  let fuel = document.getElementById("tripFuel").value;
  let note = document.getElementById("tripNote").value.trim();

  let isValid = true;
  clearErrors(tripFields);

  if (date === "") {
    showError("tripDate", "Please choose the date.");
    isValid = false;
  } else if (daysBetween(todayString(), date) > 0) {
    showError("tripDate", "A trip cannot be in the future.");
    isValid = false;
  }
  if (area.length < 2) {
    showError("tripArea", "Please enter the area.");
    isValid = false;
  }
  if (distance === "" || Number(distance) < 1) {
    showError("tripDistance", "Distance must be at least 1 km.");
    isValid = false;
  }
  if (fuel === "" || Number(fuel) < 0) {
    showError("tripFuel", "Fuel cost cannot be empty or below 0.");
    isValid = false;
  }
  if (isValid === false) {
    return false;
  }

  if (editTripIndex === -1) {
    let newTrip = { id: nextId("T", trips), deliveryId: currentDeliveryId, date: date, area: area, vehicle: vehicle,
                    distance: Number(distance), fuel: Number(fuel), note: note };
    trips.push(newTrip);
    showMessage("tripMessage", "Trip " + newTrip.id + " to " + area + " was added.", "success");
  } else {
    let trip = trips[editTripIndex];
    trip.date = date;
    trip.area = area;
    trip.vehicle = vehicle;
    trip.distance = Number(distance);
    trip.fuel = Number(fuel);
    trip.note = note;
    showMessage("tripMessage", "Trip " + trip.id + " was updated.", "success");
  }

  resetTripForm();
  refreshDeliveryPage();
  return false;
}

// Put a trip into the form for editing
function editTrip(index) {
  let trip = trips[index];
  editTripIndex = index;

  document.getElementById("tripDate").value = trip.date;
  document.getElementById("tripArea").value = trip.area;
  setRadioValue("tripVehicle", trip.vehicle);
  document.getElementById("tripDistance").value = trip.distance;
  document.getElementById("tripFuel").value = trip.fuel;
  document.getElementById("tripNote").value = trip.note;

  document.getElementById("tripFormTitle").innerHTML = "Edit Trip " + trip.id;
  document.getElementById("tripSaveButton").value = "Update Trip";
  clearErrors(tripFields);
}

// Delete a trip
function deleteTrip(index) {
  let trip = trips[index];
  if (confirm("Delete trip " + trip.id + "?") === false) {
    return;
  }
  trips = removeAt(trips, index);
  showMessage("tripMessage", "Trip " + trip.id + " was deleted.", "info");
  resetTripForm();
  refreshDeliveryPage();
}

function resetTripForm() {
  document.getElementById("tripForm").reset();
  editTripIndex = -1;
  document.getElementById("tripFormTitle").innerHTML = "Add New Trip";
  document.getElementById("tripSaveButton").value = "Add Trip";
  clearErrors(tripFields);
}


// Events
document.getElementById("tripForm").addEventListener("submit", function (event) {
  event.preventDefault();
  saveTrip();
});
document.querySelector("#tripForm .btn-secondary").addEventListener("click", resetTripForm);
document.getElementById("tripSearch").addEventListener("keyup", renderTrips);
document.getElementById("tripVehicleFilter").addEventListener("change", renderTrips);


// Part 2: assigned orders + status update + earnings

// Total price of one order
function orderTotal(order) {
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.qty;
  }
  return total;
}

// Area drop-down (each area once)
function fillAreaList() {
  let select = document.getElementById("assignedArea");
  let chosen = select.value;
  let areas = [];
  for (const order of orders) {
    if (order.deliveryId === currentDeliveryId && areas.indexOf(order.area) === -1) {
      areas.push(order.area);
    }
  }

  select.innerHTML = "<option value='All'>All areas</option>";
  for (const area of areas) {
    let option = document.createElement("option");
    option.value = area;
    option.innerHTML = area;
    select.appendChild(option);
  }
  select.value = (chosen === "") ? "All" : chosen;
}

// Assigned orders table + cash to collect
function renderAssigned() {
  let area = document.getElementById("assignedArea").value;
  let showDone = document.getElementById("assignedShowDone").checked;

  let rows = "";
  let shown = 0;
  let cash = 0;

  for (const order of orders) {
    if (order.deliveryId !== currentDeliveryId) {
      continue;
    }
    if (area !== "All" && order.area !== area) {
      continue;
    }
    if (order.status === "Delivered" && showDone === false) {
      continue;
    }

    let amount;
    if (order.paid) {
      amount = order.payment + " (Paid)";
    } else {
      amount = "COD " + formatTaka(orderTotal(order));
      if (order.status !== "Delivered") {
        cash += orderTotal(order);
      }
    }

    rows += "<tr>" +
              "<td>#" + order.id + "</td>" +
              "<td><strong>" + order.area + "</strong><br><span class='hint'>" + order.address + "</span></td>" +
              "<td>" + order.customerName + "<br><span class='hint'>" + order.phone + "</span></td>" +
              "<td>" + amount + "</td>" +
              "<td>" + statusBadge(order.status) + "</td>" +
            "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='5' class='empty-row'>No orders here.</td></tr>";
  }
  document.getElementById("assignedBody").innerHTML = rows;
  document.getElementById("assignedCount").innerHTML = shown + " order(s), " + formatTaka(cash) + " cash to collect";
}

document.getElementById("assignedArea").addEventListener("change", renderAssigned);
document.getElementById("assignedShowDone").addEventListener("change", renderAssigned);


// Status update: orders that are not delivered yet
function fillStatusOrders() {
  let select = document.getElementById("statusOrder");
  select.innerHTML = "<option value=''>-- Select order --</option>";
  for (const order of orders) {
    if (order.deliveryId === currentDeliveryId && order.status !== "Delivered") {
      let option = document.createElement("option");
      option.value = order.id;
      option.innerHTML = "#" + order.id + " - " + order.area + " (" + order.status + ")";
      select.appendChild(option);
    }
  }
}

// The step after the current one
function nextStatus(order) {
  return orderSteps[orderSteps.indexOf(order.status) + 1];
}

function showNextStatus() {
  let orderId = document.getElementById("statusOrder").value;
  let cell = document.getElementById("statusNext");
  if (orderId === "") {
    cell.innerHTML = "Choose an order first.";
    return;
  }
  let order = orders[findIndexById(orders, orderId)];
  cell.innerHTML = statusBadge(order.status) + " → " + statusBadge(nextStatus(order));
}

// Move the order one step forward
function saveStatus() {
  let orderId = document.getElementById("statusOrder").value;
  if (orderId === "") {
    showMessage("statusMessage", "Please choose an order.", "error");
    return false;
  }

  let order = orders[findIndexById(orders, orderId)];
  let newStatus = nextStatus(order);
  order.status = newStatus;

  // Delivered: cash collected and Tk 80 earned
  if (newStatus === "Delivered") {
    order.paid = true;
    addDeliveryToday();
  }

  statusLog.unshift({ time: nowString(), orderId: order.id, status: newStatus });
  showMessage("statusMessage", "#" + order.id + " is now <strong>" + newStatus + "</strong>.", "success");

  refreshDeliveryPage();
  return false;
}

function renderStatusBoard() {
  let html = "";
  for (const entry of statusLog) {
    html += "<div class='log-item'><span class='log-time'>" + entry.time + "</span><br>#" + entry.orderId +
            " → " + statusBadge(entry.status) + "</div>";
  }
  document.getElementById("statusBoard").innerHTML = html;
}

document.getElementById("statusOrder").addEventListener("change", showNextStatus);
document.querySelector("#statusSection form").addEventListener("submit", function (event) {
  event.preventDefault();
  saveStatus();
});


// Earnings
function getDeliveriesOn(date) {
  for (const day of deliveryEarnings) {
    if (day.date === date) {
      return day.deliveries;
    }
  }
  return 0;
}

function addDeliveryToday() {
  let today = todayString();
  for (const day of deliveryEarnings) {
    if (day.date === today) {
      day.deliveries++;
      return;
    }
  }
  deliveryEarnings.push({ date: today, deliveries: 1 });
}

function renderEarnings() {
  let today = todayString();
  let rows = "";
  let total = 0;
  let biggest = 1;

  for (const day of deliveryEarnings) {
    let label = (day.date === today) ? "<strong>Today</strong>" : day.date;
    rows += "<tr><td>" + label + "</td><td>" + day.deliveries + "</td><td>" + formatTaka(day.deliveries * earningPerDelivery) + "</td></tr>";
    total += day.deliveries * earningPerDelivery;
    if (day.deliveries > biggest) {
      biggest = day.deliveries;
    }
  }
  if (getDeliveriesOn(today) === 0) {
    rows += "<tr><td><strong>Today</strong></td><td>0</td><td>Tk 0</td></tr>";
  }
  document.getElementById("earningsBody").innerHTML = rows;
  document.getElementById("earningsTotal").innerHTML = formatTaka(total);

  // Bar chart (width = share of the best day)
  let chart = document.getElementById("earningsChart");
  chart.innerHTML = "";
  for (const day of deliveryEarnings) {
    let row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = "<div class='bar-label'>" + day.date.slice(5) + "</div>" +
                    "<div class='bar-track'><div class='bar-fill'></div></div>" +
                    "<div class='bar-value'>" + (day.deliveries * earningPerDelivery) + "</div>";
    chart.appendChild(row);
    row.getElementsByClassName("bar-fill")[0].style.width = Math.round(day.deliveries / biggest * 100) + "%";
  }
}


// Redraw everything
function refreshDeliveryPage() {
  updateDeliveryStats();
  renderTrips();
  fillAreaList();
  renderAssigned();
  fillStatusOrders();
  showNextStatus();
  renderStatusBoard();
  renderEarnings();
}


// Start
refreshDeliveryPage();

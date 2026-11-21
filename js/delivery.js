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

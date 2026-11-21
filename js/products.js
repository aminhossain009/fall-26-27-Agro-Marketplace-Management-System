/* =====================================================================
   products.js  -  All Products page (products.html)
   ---------------------------------------------------------------------
   Shows every product as a card and filters the cards by the search
   box, the category list and the district list. The hero search on the
   home page sends the word here in the URL: products.html?q=rice
   ===================================================================== */


// Fills the district list from the products (each district once)
function fillDistrictList() {
  let select = document.getElementById("catalogDistrict");
  let districts = [];
  for (const product of products) {
    if (districts.indexOf(product.district) === -1) {
      districts.push(product.district);
    }
  }
  districts.sort();

  select.innerHTML = "<option value='All'>All Districts</option>";
  for (const district of districts) {
    let option = document.createElement("option");
    option.value = district;
    option.innerHTML = district;
    select.appendChild(option);
  }
}

// The photo of a card, or a grey "No photo" box
function cardImageHtml(product) {
  if (product.image === "" || product.image == null) {
    return "<div class='product-image no-image'>No photo</div>";
  }
  return "<img width='200' height='150' class='product-image' src='" + product.image + "' alt='" + product.name + "'>";
}

function renderProductCards() {
  let keyword = document.getElementById("catalogSearch").value;
  let category = document.getElementById("catalogCategory").value;
  let district = document.getElementById("catalogDistrict").value;

  let html = "";
  let shown = 0;

  for (const product of products) {
    let matchesKeyword = containsText(product.name, keyword) || containsText(product.category, keyword) ||
                         containsText(product.district, keyword) || containsText(product.farmer, keyword);
    let matchesCategory = (category === "All" || product.category === category);
    let matchesDistrict = (district === "All" || product.district === district);

    if (matchesKeyword && matchesCategory && matchesDistrict) {
      html += "<div class='product'>" +
                cardImageHtml(product) +
                "<h3 class='name'>" + product.name + "</h3>" +
                "<p class='price'>Tk " + product.price + " / " + product.unit + "</p>" +
                "<p class='hint'>" + product.category + " · " + product.district + "</p>" +
                stockBadge(product) + "<br>" +
                "<a class='btn btn-small' href='login.html'>Buy</a>" +   // visitors must log in to buy
              "</div>";
      shown++;
    }
  }

  if (shown === 0) {
    html = "<p class='hint'>No products match your search.</p>";
  }
  document.getElementById("catalogList").innerHTML = html;
  document.getElementById("catalogCount").innerHTML = shown + " product(s) found";
}


// Events
document.getElementById("catalogSearch").addEventListener("keyup", renderProductCards);
document.getElementById("catalogCategory").addEventListener("change", renderProductCards);
document.getElementById("catalogDistrict").addEventListener("change", renderProductCards);


// Start
fillDistrictList();
document.getElementById("catalogSearch").value = readSearchWord();
renderProductCards();

// fixed bugs in js css

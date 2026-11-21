/* =====================================================================
   home.js  -  The home page (index.html)

   ---------------------------------------------------------------------
   The live search table is renderCatalog() in common.js; it reads the
   search box (catalogSearch) and the category list (catalogCategory)
   and fills the results table (catalogBody).
   This file adds the "Popular Products" cards and the hero search.
   ===================================================================== */


// "Popular Products" = the products that have a photo
function renderPopular() {
  let html = "";
  for (const product of products) {
    if (product.image !== "") {
      html += "<div class='product'>" +
        "<img width='200' height='150' class='product-image' src='" + product.image + "' alt='" + product.name + "'>" +
        "<h3 class='name'>" + product.name + "</h3>" +
        "<p class='price'>Tk " + product.price + " / " + product.unit + "</p>" +
        "<a class='btn btn-small' href='login.html'>Buy</a>" +   // visitors must log in to buy
        "</div>";
    }
  }
  document.getElementById("popularList").innerHTML = html;
}


// readSearchWord() is in common.js (products.html uses it too)


// Start
renderPopular();
document.getElementById("catalogSearch").value = readSearchWord();
renderCatalog();

// fixed bugs in js css

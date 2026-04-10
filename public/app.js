/**
 * SAMBETHEL - PREMIUM PROVISIONS
 * Full Application Logic
 */

// 1. Configuration & State
let cart = [];
let allProducts = []; // Master list to allow instant filtering without re-fetching
const API_URL = "/api/products";
const WHATSAPP_NUMBER = "2348078777465"; // Ensure this is correct

// 2. View Management (Single Page Application Logic)
function showView(viewId) {
  // Hide all view sections
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show the requested section
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0, 0);
  }
}

// 3. Currency Formatter (Naira)
function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// 4. Data Fetching & Setup
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch products from server");

    allProducts = await res.json();

    console.log("--- DATABASE INSPECTION ---");
    console.log("Total items received:", allProducts.length);
    if (allProducts.length > 0) {
      console.log("First product sample:", allProducts[0]);
    }
    console.log("---------------------------");

    // Once data is loaded, setup the UI
    setupViews();
  } catch (err) {
    console.error("Error fetching products:", err);
    // Optional: Show a toast error to the user here
  }
}

// This function organizes products into their respective categories and builds filters
function setupViews() {
  // Split products into main groups
  const tasteProducts = allProducts.filter(
    (p) =>
      (p.mainCategory || p.category || "").toLowerCase().trim() === "taste",
  );
  const superProducts = allProducts.filter(
    (p) =>
      (p.mainCategory || p.category || "").toLowerCase().trim() ===
      "supermarket",
  );

  // Render the initial product grids
  renderGrid(tasteProducts, "taste-grid");
  renderGrid(superProducts, "supermarket-grid");

  // Generate the clickable Filter Chips (Sub-categories)
  createFilters(tasteProducts, "taste-filters", "taste");
  createFilters(superProducts, "supermarket-filters", "supermarket");
}

// 5. Filter Logic
function createFilters(products, containerId, mainType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Get unique subcategories from the product list
  const subCategories = [
    "All",
    ...new Set(products.map((p) => p.subCategory).filter(Boolean)),
  ];

  container.innerHTML = subCategories
    .map(
      (sub) => `
    <button onclick="filterBySubCategory('${mainType}', '${sub}')" 
            class="filter-chip whitespace-nowrap px-5 py-2 rounded-full border border-gray-200 text-sm font-medium transition-all hover:border-premiumGold text-gray-600"
            data-sub="${sub}">
      ${sub}
    </button>
  `,
    )
    .join("");

  // Set the "All" button as active by default
  container
    .querySelector("button")
    .classList.add("bg-premiumGreen", "text-white", "border-premiumGreen");
}

function filterBySubCategory(mainType, subCategory) {
  const gridId = mainType === "taste" ? "taste-grid" : "supermarket-grid";
  const filterContainer =
    mainType === "taste" ? "taste-filters" : "supermarket-filters";

  // 1. Filter the master list
  const filtered = allProducts.filter((p) => {
    const matchesMain =
      (p.mainCategory || p.category || "").toLowerCase().trim() === mainType;
    const matchesSub = subCategory === "All" || p.subCategory === subCategory;
    return matchesMain && matchesSub;
  });

  // 2. Re-render the grid
  renderGrid(filtered, gridId);

  // 3. Update button styles (Active/Inactive)
  const buttons = document
    .getElementById(filterContainer)
    .querySelectorAll("button");
  buttons.forEach((btn) => {
    if (btn.getAttribute("data-sub") === subCategory) {
      btn.classList.add("bg-premiumGreen", "text-white", "border-premiumGreen");
      btn.classList.remove("text-gray-600", "border-gray-200");
    } else {
      btn.classList.remove(
        "bg-premiumGreen",
        "text-white",
        "border-premiumGreen",
      );
      btn.classList.add("text-gray-600", "border-gray-200");
    }
  });
}

// 6. Product Rendering
function renderGrid(products, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML =
      '<p class="col-span-full text-center py-10 text-gray-400">No products found in this category.</p>';
    return;
  }

  grid.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");
}

function createProductCard(product) {
  // Sanitization: Handles names with single quotes (e.s. "Baker's Cake")
  const safeName = product.name.replace(/'/g, "\\'");

  return `
    <div class="group">
        <div class="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-4">
            <img src="${product.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <button onclick="addToCart('${product._id}', '${safeName}', ${product.price})" 
                    class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur py-2 rounded-lg font-bold text-sm translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-premiumGreen hover:text-white">
                Add to Bag
            </button>
        </div>
        <div class="text-center">
            <p class="text-[10px] uppercase tracking-widest text-premiumGold font-bold">${product.subCategory || "General"}</p>
            <h3 class="text-lg font-serif text-gray-800 mt-1">${product.name}</h3>
            <p class="text-premiumGreen font-semibold mt-1">${formatNaira(product.price)}</p>
        </div>
    </div>
  `;
}

// 7. Cart Operations
function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const cartContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  if (!cartContainer) return;

  // Update badge count
  cartCount.innerText = cart.reduce((acc, item) => acc + item.qty, 0);

  // Update list of items
  cartContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="flex justify-between items-center border-b border-gray-50 pb-4">
            <div class="flex-1">
                <h4 class="font-bold text-sm text-gray-800">${item.name}</h4>
                <p class="text-xs text-gray-500">${item.qty} x ${formatNaira(item.price)}</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="changeQty('${item.id}', -1)" class="text-gray-400 hover:text-black"><i class="fas fa-minus-circle"></i></button>
                <span class="text-sm font-bold">${item.qty}</span>
                <button onclick="changeQty('${item.id}', 1)" class="text-gray-400 hover:text-black"><i class="fas fa-plus-circle"></i></button>
            </div>
        </div>
    `,
    )
    .join("");

  // Update grand total
  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  cartTotal.innerText = formatNaira(total);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
  }
  updateCartUI();
}

function toggleCart() {
  document.getElementById("cart-modal").classList.toggle("hidden");
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert("Your bag is empty!");
    return;
  }

  let msg = "✨ *New Order from Sambethel* ✨\n\n";
  let total = 0;

  cart.forEach((item) => {
    msg += `▪️ ${item.name} (${item.qty} x ${formatNaira(item.price)})\n`;
    total += item.qty * item.price;
  });

  msg += `\n💰 *Total: ${formatNaira(total)}*`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// 8. Initialization
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

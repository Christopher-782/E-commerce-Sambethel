let cart = [];
let allProducts = []; // Master list to allow filtering
const API_URL = "http://localhost:5000/api/products";
const WHATSAPP_NUMBER = "2348072011614";

// 1. View Management
function showView(viewId) {
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active");
  });

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0, 0);
  }
}

// 2. Currency Formatter
function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// 3. Fetching & Rendering
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch products");
    allProducts = await res.json();

    // Initialize the views
    setupViews();
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

// This function sets up the initial state of the pages
function setupViews() {
  // 1. Separate products into their main groups
  const tasteProducts = allProducts.filter(
    (p) =>
      (p.mainCategory || p.category || "").toLowerCase().trim() === "taste",
  );
  const superProducts = allProducts.filter(
    (p) =>
      (p.mainCategory || p.category || "").toLowerCase().trim() ===
      "supermarket",
  );

  // 2. Render the initial grids
  renderGrid(tasteProducts, "taste-grid");
  renderGrid(superProducts, "supermarket-grid");

  // 3. Create the Filter Buttons
  createFilters(tasteProducts, "taste-filters", "taste");
  createFilters(superProducts, "supermarket-filters", "supermarket");
}

// Creates the clickable "Chips"
function createFilters(products, containerId, mainType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Get unique subcategories
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

// The actual filtering engine
function filterBySubCategory(mainType, subCategory) {
  const gridId = mainType === "taste" ? "taste-grid" : "supermarket-grid";
  const filterContainer =
    mainType === "taste" ? "taste-filters" : "supermarket-filters";

  // 1. Filter the data
  const filtered = allProducts.filter((p) => {
    const matchesMain =
      (p.mainCategory || p.category || "").toLowerCase().trim() === mainType;
    const matchesSub = subCategory === "All" || p.subCategory === subCategory;
    return matchesMain && matchesSub;
  });

  // 2. Update the Grid
  renderGrid(filtered, gridId);

  // 3. Update Button Styles (Active State)
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

// Core rendering function
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

// ... (Rest of your Cart functions: addToCart, updateCartUI, changeQty, toggleCart, checkoutWhatsApp) ...

// 5. Initialization
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

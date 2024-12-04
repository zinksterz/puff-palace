document.addEventListener("DOMContentLoaded", async () => {
  try {
    //fetch and display categories
    const categories = await fetchCategories();
    if (categories) renderCategories(categories);

    const products = await fetchItems();
    if (products) populateProductTable(products);

    const discounts = await fetchDiscounts();
    if (discounts) populateDiscountTable(discounts);

    const discountForm = document.getElementById("discount-form");
    if (discountForm) {
      discountForm.addEventListener("submit", (e) => {
        e.preventDefault();
        applyDiscount();
      });
    }
  } catch (error) {
    console.error("Error initializing admin panel: ", error);
  }
});

async function fetchCategories() {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories: ", error);
  }
}

async function fetchItems(categoryId = null) {
  try {
    const response = await fetch(`/api/category/${categoryId}`);
    if (!response.ok) throw new Error("Failed to fetch items");
    return await response.json();
  } catch (error) {
    console.error("Error fetching items: ", error);
  }
}

async function fetchDiscounts() {
  try {
    const response = await fetch("/api/discounts");
    if (!response.ok){
        throw new Error(`Failed to fetch discounts: ${response.statusText}`);
  }
    const {discounts} = await response.json();
    populateDiscountTable(discounts);
    } catch(error){
        console.error("Error fetching discounts: ",error);
    }
}

async function renderCategories(categories) {
  const categoryContainer = document.getElementById("category-container");
  if (!categoryContainer) return;

  categoryContainer.innerHTML = "";
  categories.forEach((category) => {
    const categoryElement = document.createElement("div");
    categoryElement.classList.add("category-card");
    categoryElement.innerHTML = `
        <h3>${category.name}</h3>
        <button onclick="fetchItems('${category.id}')">View Items</button>
        `;
    categoryContainer.appendChild(categoryElement);
  });
}

function populateProductTable(products) {
  const tableBody = document.getElementById("product-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear existing rows
  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.categoryName || "Uncategorized"}</td>
            <td>$${(product.price / 100).toFixed(2)}</td>
            <td>
                <button onclick="editProduct('${product.id}')">Edit</button>
                <button onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function renderItems(items) {
  const itemsContainer = document.getElementById("items-container");
  itemsContainer.innerHTML = "";

  items.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("item-card");
    itemElement.innerHTML = `
        <h4>${item.name}</h4>
        <p>Price: $${(item.price / 100).toFixed(2)}</p>
        <button onclick="applyDiscount('${
          item.id
        }', 50)">Apply 50% Discount</button>
        `;
    itemsContainer.appendChild(itemElement);
  });
}

function populateDiscountTable(discounts) {
  const tableBody = document.getElementById("discount-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear existing rows
  discounts.forEach((discount) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${discount.productName || discount.categoryName}</td>
            <td>${discount.percentage}%</td>
            <td>${new Date(discount.validUntil).toLocaleDateString()}</td>
            <td>
                <button onclick="editDiscount('${discount.id}')">Edit</button>
                <button onclick="removeDiscount('${
                  discount.id
                }')">Remove</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

async function applyDiscount(itemId, discountPercentage) {
  try {
    const response = await fetch(`/api/items/${itemId}/discount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discount: discountPercentage }),
    });
    if (!response.ok) throw new Error("Failed to apply discount!");
    console.log(`Discount applied to item ${itemId}`);
  } catch (error) {
    console.error("Error applying discount:", error);
  }
}

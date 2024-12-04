
document.addEventListener("DOMContentLoaded", async() =>{
    try {
        //fetch and display categories
        const categories = await fetchCategories();
        renderCategories(categories);

        //Set up event listeners for discount actions
        document.getElementById("discount-form").addEventListener("submit", applyDiscount);   
    } catch (error) {
        console.error("Error initializing admin panel: ", error);
    }
});

document.addEventListener("DOMContentLoaded", async() => {
    try {
        const products = await fetchItems();
        populateProductTable(products);

        const discounts = await fetchDiscounts();
        populateDiscountTable(discounts);
    } catch (error) {
        console.error("Error loading admin panel data: ", error);
    }
});

async function fetchCategories(){
    try{
        const response = await fetch("/api/categories");
        if(!response.ok) throw new Error("Failed to fetch categories");
        return await response.json();
    } catch(error) {
        console.error("Error fetching categories: ", error);
    }
}

async function renderCategories(categories){
    const categoryContainer = document.getElementById("category-container");
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

async function fetchItems(categoryId) {
    try{
        const response = await fetch(`/api/category/${categoryId}/items`);
        if(!response.ok) throw new Error("Failed to fetch items");
        const items = await response.json();
        renderItems(items);
    } catch (error) {
        console.error("Error fetching items: ", error);
    }
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
        <button onclick="applyDiscount('${item.id}', 50)">Apply 50% Discount</button>
        `;
        itemsContainer.appendChild(itemElement);
    });
}

async function applyDiscount(itemId, discountPercentage) {
    try {
        const response = await fetch(`/api/items/${itemId}/discount`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({discount: discountPercentage}),
        });
        if(!response.ok) throw new Error("Failed to apply discount!");
        console.log(`Discount applied to item ${itemId}`);
    } catch (error) {
        console.error("Error applying discount:", error);
    }
}

async function populateProductTable(products) {
  const tableBody = document.getElementById("product-table-body");
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

async function populateDiscountTable(discounts) {
  const tableBody = document.getElementById("discount-table-body");
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
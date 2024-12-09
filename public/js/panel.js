document.addEventListener("DOMContentLoaded", async () => {
  try {
    const categories = await fetchCategories();
    if(categories) renderCategories(categories);
    
    //fetch and display all items
    const allItems = await fetchItems();
    if (allItems) populateProductTable(allItems);

    //fetch and display discounts
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
    return [];
  }
}


async function fetchItems(categoryId = "") {
  try{
    const endpoint = categoryId ? `/api/category/${categoryId}` : `/api/items`;
    const response = await fetch(endpoint);
    if(!response.ok) throw new Error("Failed to fetch items");
    const items = await response.json();
    if(!items || items.length === 0){
      console.warn("No items were found");
      return [];
    }
    return items;
  } catch(error){
    console.error("Error fetching items: ", error);
    return [];
  }
}

async function fetchDiscounts() {
  try {
    const response = await fetch("/api/discounts");
    if (!response.ok) {
      throw new Error(`Failed to fetch discounts: ${response.statusText}`);
    }
    const { discounts } = await response.json();
    // populateDiscountTable(discounts);
    return discounts;
  } catch (error) {
    console.error("Error fetching discounts: ", error);
    return [];
  }
}

async function renderCategories(categories) {
  const categoryContainer = document.getElementById("category-container");
  if (!categoryContainer) return;
  console.log("renderCategories is recieving the following as a parameter: ",categories);
  categoryContainer.innerHTML = "";
  categories.forEach((category) => {
    const categoryCard = document.createElement("div");
    categoryCard.classList.add("category-card");
    categoryCard.innerHTML = `
        <h3>${category.name}</h3>
        <button>View Items</button>
        `;

    //event listener for clarity
    const button = categoryCard.querySelector("button");
    button.addEventListener("click", async () => {
      try {
        const items = await fetchItems(category.id);
        populateProductTable(items);
      } catch (error) {
        console.error(`Error fetching items for category: ${category.name}`);
      }
    });
    categoryContainer.appendChild(categoryCard);
  });
}

function populateProductTable(products) {
  const tableBody = document.getElementById("product-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear existing rows
  products.forEach((product) => {
    const row = document.createElement("tr"); //eventually will change product.categoryId from id to category.name likely using the mapping function
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
            <td>${discount.product || discount.id}</td>
            <td>${discount.discount}</td>
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

async function addDiscount(product, discount, validUntil) {
  try {
    const response = await fetch("/api/discounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product, discount, validUntil }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add discount: ${response.statusText}`);
    }
    const { discount: newDiscount } = await response.json();
    console.log("Discount added successfully: ", newDiscount);
    fetchDiscounts(); //refreshes discount table after adding the discount
  } catch (error) {
    console.error("Error adding discount: ", error);
  }
}

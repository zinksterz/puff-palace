document.addEventListener("DOMContentLoaded", async () => {
  try {
    const categories = await fetchCategories();
    if (categories) renderCategories(categories);

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

    const tableBody = document.getElementById("product-table-body");
    if(tableBody){
      tableBody.addEventListener("click", (e) =>{
        const productId = e.target.dataset.id;
        if(e.target.classList.contains("edit")){
          const product = JSON.parse(e.target.dataset.product);
          openEditModal(product);
        } else if(e.target.classList.contains("delete")){
          deleteProduct(productId);
        }
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
  try {
    const endpoint = categoryId ? `/api/category/${categoryId}` : `/api/items`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch items");
    const items = await response.json();
    if (!items || items.length === 0) {
      console.warn("No items were found");
      return [];
    }
    return items;
  } catch (error) {
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
    return discounts;
  } catch (error) {
    console.error("Error fetching discounts: ", error);
    return [];
  }
}

async function handleCategorySelection(categoryId, categoryName, categoryCard) {
  try {
    const items = await fetchItems(categoryId);

    //update category header
    const categoryHeader = document.getElementById("current-category-header");
    const currentCategory = document.getElementById("current-category");

    currentCategory.textContent = categoryName;
    categoryHeader.dataset.categoryId = categoryId;
    categoryHeader.style.display = "block";
    
    //Update selected card with item count
    const itemCount = items.length;
    const itemCountDisplay = categoryCard.querySelector(".item-count");
    itemCountDisplay.textContent = `${itemCount} items`;
    populateProductTable(items);
  } catch (error) {
    console.error(`Error fetching items for category: ${error}`);
  }
}

async function renderCategories(categories) {
  const categoryContainer = document.getElementById("category-container");
  if (!categoryContainer) return;
  //sort categories alphabetically
  categories.sort((a,b) => a.name.localeCompare(b.name));
  categoryContainer.innerHTML = "";
  categories.forEach((category) => {
    const categoryCard = document.createElement("div");
    categoryCard.classList.add("category-card");
    categoryCard.innerHTML = `
        <h3>${category.name}</h3>
        <p class="item-count"></p>
        <button>View Items</button>
        `;

    //event listener for clarity
    const button = categoryCard.querySelector("button");
    button.addEventListener("click", async () => {
      document
        .querySelectorAll(".category-card")
        .forEach((card) => card.classList.remove("selected"));
      categoryCard.classList.add("selected");
      handleCategorySelection(category.id, category.name, categoryCard);
    });
    //append card to container
    categoryContainer.appendChild(categoryCard);
  });
}


function openEditModal(product){
  const modal = document.getElementById("edit-item-modal");
  const form = document.getElementById("edit-item-form");
  //Prefill form
  document.getElementById("edit-item-name").value = product.name;
  document.getElementById("edit-item-price").value = (product.price / 100).toFixed(2);
  document.getElementById("edit-item-stock").value = product.available;
  
  //Store prodId for submission
  form.dataset.productId = product.id;
  
  modal.style.display = "flex";
}

document.getElementById("close-edit-modal").addEventListener("click",() =>{
  const modal = document.getElementById("edit-item-modal");
  modal.style.display = "none";
});
window.onclick = function (event) {
  const modal = document.getElementById("edit-item-modal");
  if(event.target === modal){
    modal.style.display = "none";
  }
};

document.getElementById("edit-item-form").addEventListener("submit", async (e) =>{
  e.preventDefault();
  
  
  const form = e.target;
  const productId = form.dataset.productId;
  const updatedProduct = {
    name: document.getElementById("edit-item-name").value,
    price: parseFloat(document.getElementById("edit-item-price").value) * 100,
    available: document.getElementById("edit-item-stock").value === "true",
  };
  
  try{
    const response = await fetch(`/api/items/${productId}`,{
      method:"PUT",
      headers:{
        "Content-Type": "application/json",
      },
      body:JSON.stringify(updatedProduct),
    });
    
    if(!response.ok) throw new Error("Failed to update product");
    
    console.log("Product updated successfully!");
    //Close modal and refresh product table
    document.getElementById("edit-item-modal").style.display = "none";
    const currentCategoryId = document.getElementById("current-category-header").dataset.categoryId;
    const items = await fetchItems(currentCategoryId);
    populateProductTable(items);
  } catch(error){
    console.error("Error updating product: ", error);
  }
});

async function deleteProduct(productId){
  try{
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if(!confirmDelete) return;

    const response = await fetch(`/api/items/${productId}`,{
      method: "DELETE",
    });
    if(!response.ok) throw new Error("Failed to delete product");
    console.log("Product deleted successfully!");
    //refresh product table
    const currentCategoryId = document.getElementById("current-category-header").dataset.categoryId;
    const items = await fetchItems(currentCategoryId);
    populateProductTable(items);
  }catch(error){
    console.error("Error deleting product: ", error);
    alert("Failed to delete the product. Please try again.");
  }
}

//Open add product modal
document.getElementById("add-product-btn").addEventListener("click", () =>{
  const modal = document.getElementById("add-product-modal");
  modal.style.display = "flex";
});
//Close add product modal
document.getElementById("close-add-modal").addEventListener("click", () => {
  const modal = document.getElementById("add-product-modal");
  modal.style.display = "none";
});
window.onclick = function (event){
  const modal = document.getElementById("add-product-modal");
  if(event.target === modal){
    modal.style.display = "none";
  }
};

document.getElementById("add-product-form").addEventListener("submit", async (e) =>{
  e.preventDefault();

  const categoryId = document.getElementById("current-category-header").dataset.categoryId;
  const categoryName = document.getElementById("current-category").textContent;
  const newProduct = {
    name: document.getElementById("add-product-name").value,
    price: parseFloat(document.getElementById("add-product-price").value) * 100,
    available: document.getElementById("add-product-stock").value === "true",
    categories:  [
      {
        id:categoryId,
        name:categoryName,
      },
    ],
  };
  try{
    const response = await fetch("/api/items", {
      method: "POST",
      headers:{
        "content-type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });
    if(!response.ok) throw new Error("Failed to add product");
    console.log("Product added successfully!");
    //Close modal and refresh product table
    document.getElementById("add-product-modal").style.display = "none";
    const items = await fetchItems(categoryId);
    populateProductTable(items);
  } catch(error){
    console.error("Error adding product: ", error);
    alert("Failed to add the product. Please try again.");
  }
});

function populateProductTable(products) {
  const tableBody = document.getElementById("product-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear existing rows
  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.available ? "In Stock" : "Out of Stock"}</td> 
            <td>$${(product.price / 100).toFixed(2)}</td>
            <td>
                <button class="product-action-btn edit" data-product='${JSON.stringify(product)}'>Edit</button>
                <button class="product-action-btn delete" data-id="${product.id}">Delete</button>
            </td>
        `;
    tableBody.appendChild(row);
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
                <button class="product-action-btn edit" onclick="editDiscount('${discount.id}')">Edit</button>
                <button class="product-action-btn delete" onclick="removeDiscount('${
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

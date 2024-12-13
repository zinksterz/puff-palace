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

    //initializes product table with a message
    populateProductTable([]);

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
//Fetching discounts
async function fetchDiscounts() {
  try {
    const response = await fetch("/api/items/discounted");
    if (!response.ok) {
      throw new Error(`Failed to fetch discounted items.`);
    }
    const discounts = await response.json();
    return discounts;
  } catch (error) {
    console.error("Error fetching discounts: ", error);
    return [];
  }
}

//Edit discounts
async function editDiscount(discountId){
  const newPercentage = prompt("Enter the new discount percentage:");
  const validUntil = prompt("Enter the date you want this sale to end (YYYY-MM-DD):");

  if(!newPercentage || !validUntil){
    alert("Both percentage and valid until date are required.");
    return;
  }

  try{
    const response = await fetch("/api/update-discount",{
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        itemId: discountId,
        discount_percentage: parseFloat(newPercentage),
        validUntil,
      }),
    });
    if(!response.ok) throw new Error("Failed to update discount");
    alert("Discount updated successfully!");
    const discounts = await fetchDiscounts();
    populateDiscountTable(discounts);
  }catch(error){
    console.error("Error editing discount: ", error);
    alert("Failed to edit discount.");
  }
}

//Remove a discount
async function removeDiscount(discountId) {
  const confirmRemove = confirm(
    "Are you sure you want to remove this discount?"
  );
  if (!confirmRemove) return;

  try {
    const response = await fetch(`/api/update-discount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: discountId,
        discount_percentage: null, // Set discount to null
        validUntil: null,
      }),
    });

    if (!response.ok) throw new Error("Failed to remove discount");
    alert("Discount removed successfully!");

    const discounts = await fetchDiscounts();
    populateDiscountTable(discounts);
  } catch (error) {
    console.error("Error removing discount:", error);
    alert("Failed to remove discount.");
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


async function openEditModal(product){
  const modal = document.getElementById("edit-item-modal");
  const form = document.getElementById("edit-item-form");
  try{
    //Fetch necessary details from the database
    console.log(product.id);
    const dbResponse = await fetch(`/api/items/${product.id}/psdb`);
    if(!dbResponse.ok) throw new Error("Failed to fetch product data from the database.");
    const dbData = await dbResponse.json();

    //Prefill Clover Fields
    document.getElementById("edit-item-name").value = product.name;
    document.getElementById("edit-item-price").value = (product.price / 100).toFixed(2);
    document.getElementById("edit-item-stock").value = product.available;
    
    //Prefill Additional Fields from database
    document.getElementById("edit-item-description").value = dbData.description || "";
    document.getElementById("edit-item-tags").value = dbData.tags ? dbData.tags.join(",") : "";
    document.getElementById("edit-item-color").value = dbData.color || "";
    document.getElementById("edit-item-size").value = dbData.size || "";
    document.getElementById("edit-item-featured").value = dbData.is_featured ? "true" : "false";

    //Store prodId for submission
    form.dataset.productId = product.id;
    
    //Show the modal
    modal.style.display = "flex";
  }catch(error){
    console.error("Error opening edit modal: ", error);
    alert("Failed to load item details. Please refresh the page and try again.");
  }
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

  //Building the updated product object with all fields (including db fields)
  const updatedProduct = {
    name: document.getElementById("edit-item-name").value,
    price: parseFloat(document.getElementById("edit-item-price").value) * 100,
    available: document.getElementById("edit-item-stock").value === "true",
    description: document.getElementById("edit-item-description").value,
    tags: document.getElementById("edit-item-tags").value.split(","),
    color: document.getElementById("edit-item-color").value, // New field
    size: document.getElementById("edit-item-size").value, // New field
    is_featured: document.getElementById("edit-item-featured").value === "true", // New field
    image_url: document.getElementById("edit-item-image").value,
    category_id: document.getElementById("current-category-header").dataset.categoryId,
  };
  
  try{
    //Step 1 for updating clover item
    const cloverFields ={
      name: updatedProduct.name,
      price: updatedProduct.price,
      available: updatedProduct.available,
    };

    const cloverResponse = await fetch(`/api/items/${productId}`,{
      method:"PUT",
      headers:{
        "Content-Type": "application/json",
      },
      body:JSON.stringify(cloverFields),
    });
    
    if(!cloverResponse.ok) {
      throw new Error("Failed to update product in Clover");
    }

    console.log("Product updated successfully in Clover!");

    //Step 2 for updating database with additional fields
    const dbResponse = await fetch(`/api/items/${productId}/psdb`,{
      method: "PUT",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    if(!dbResponse.ok) {
      throw new Error("Failed to update product in Database...");
    }

    console.log("Product updated successfully in database!");

    //Step 3 for updating and refreshing ui and populating items original category
    document.getElementById("edit-item-modal").style.display = "none";
    const currentCategoryId = document.getElementById("current-category-header").dataset.categoryId;
    const items = await fetchItems(currentCategoryId);
    populateProductTable(items);
  } catch(error){
    console.error("Error updating product: ", error);
    alert(`Error updating product: ${error.message}`);
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
    price: Math.round(parseFloat(document.getElementById("add-product-price").value) * 100),
    available: document.getElementById("add-product-stock").value === "true",
    description: document.getElementById("add-product-description").value,
    tags: document.getElementById("add-product-tags").value.split(","),
    color: document.getElementById("add-product-color").value,
    size: document.getElementById("add-product-size").value,
    is_featured:
      document.getElementById("add-product-featured").value === "true",
    image_url: document.getElementById("add-product-image").value,
    category_id: categoryId,
  };

  try{
    const cloverFields = {
      name: newProduct.name,
      price: newProduct.price,
      available: newProduct.available,
      categories: [{
        id: categoryId,
        name: categoryName,
      }],
    };

    const cloverResponse = await fetch("/api/items", {
      method: "POST",
      headers:{
        "content-type": "application/json",
      },
      body: JSON.stringify(cloverFields),
    });

    if(!cloverResponse.ok) throw new Error("Failed to add product to Clover!");

    const cloverData = await cloverResponse.json();
    console.log("Product added successfully!", cloverData);

    newProduct.id = cloverData.id;

    const dbResponse = await fetch("/api/items/psdb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    if(!dbResponse.ok) throw new Error("Failed to add product to database...");

    console.log("Product successfully added to the database!");
    
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

  if(!products || products.length === 0) {
    //Display message when no products are available
    const noItemsRow = document.createElement("tr");
    noItemsRow.innerHTML = `<td colspan="4" style="text-align: center;">Please select a category above to view and update products</td>`;
    tableBody.appendChild(noItemsRow);
    return;
  }
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
  if(discounts.length === 0) {
    //displays message if there's no discounts available
    const noItemsRow = document.createElement("tr");
    noItemsRow.innerHTML = `<td colspan="4" style="text-align: center">There are currently no discounted items to display</td>`;
    tableBody.appendChild(noItemsRow);
    return;
  }
  discounts.forEach((discount) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${discount.name}</td>
            <td>${discount.discount_percentage}%</td>
            <td>${new Date(discount.discount_valid_until).toLocaleDateString()}</td>
            <td>
                <button class="product-action-btn edit" onclick="editDiscount('${discount.id}')">Edit</button>
                <button class="product-action-btn delete" onclick="removeDiscount('${discount.id}')">Remove</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}



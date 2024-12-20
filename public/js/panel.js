//Cached DOM elements
const productTableBody = document.getElementById("product-table-body");
const discountTableBody = document.getElementById("discount-table-body");
const discountForm = document.getElementById("discount-form");
const discountModal = document.getElementById("discount-modal");
const editModal = document.getElementById("edit-item-modal");
const addProductModal = document.getElementById("add-product-modal");
const editDiscountModal = document.getElementById("edit-discount-modal");
const addProductForm = document.getElementById("add-product-form");
const editDiscountForm = document.getElementById("edit-discount-form");

function showModal(modal) {
  modal.classList.add("show");
  modal.style.display = "flex";
}

function hideModal(modal) {
  modal.classList.remove("show");
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const categories = await fetchCategories();
    if (categories) renderCategories(categories);

    //fetch and display discounts
    const discounts = await fetchDiscounts();
    if (discounts) populateDiscountTable(discounts);

    //initializes product table with a message
    populateProductTable([]);

    if (productTableBody) {
      productTableBody.addEventListener("click", (e) => {
        const productId = e.target.dataset.id;
        if (e.target.classList.contains("edit")) {
          const product = JSON.parse(e.target.dataset.product);
          openEditModal(product);
        } else if (e.target.classList.contains("delete")) {
          deleteProduct(productId);
        } else if (e.target.classList.contains("discount")) {
          const productId = e.target.dataset.id;

          discountForm.dataset.type = "item";
          discountForm.dataset.itemId = productId;
          showModal(discountModal);
        }
      });
    }

    // Form submission logic
    discountForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const discountPercentage = parseFloat(
        document.getElementById("discount-percentage").value
      );
      const validUntil = document.getElementById("discount-valid-until").value;
      const isCategory = e.target.dataset.type === "category";

      if (
        isNaN(discountPercentage) ||
        discountPercentage <= 0 ||
        discountPercentage > 100
      ) {
        alert("Please enter a valid discount percentage (1-100).");
        return;
      }
      if (!validUntil) {
        alert("Please specify a valid end date for the discount.");
        return;
      }

      try {
        const payload = isCategory
          ? {
              categoryId: discountForm.dataset.categoryId,
              discountPercentage,
              validUntil,
            }
          : {
              itemId: discountForm.dataset.itemId,
              discountPercentage,
              validUntil,
            };

        console.log("Payload being sent:", payload);

        const endpoint = isCategory
          ? "api/update-category-discount"
          : "api/update-discount";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to apply discount");

        alert("Discount applied successfully!");
        discountForm.reset();
        discountModal.classList.remove("show");
        discountModal.style.display = "none";

        const discounts = await fetchDiscounts();
        populateDiscountTable(discounts);
      } catch (error) {
        console.error("Error applying discount:", error);
        alert("Failed to apply discount. Please try again.");
      }
    });
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
  const discountTable = document.getElementById("discount-table-body");
  discountTable.innerHTML =
    "<tr><td colspan='4' style='text-align: center;'>Loading...</td></tr>";
  try {
    const response = await fetch("/api/items/discounted");
    if (!response.ok) throw new Error(`Failed to fetch discounted items.`);
    const discounts = await response.json();
    console.log("Fetched discounts:", discounts);
    return discounts;
  } catch (error) {
    console.error("Error fetching discounts: ", error);
    discountTable.innerHTML =
      "<tr><td colspan='4' style='text-align: center;'>Error loading discounts.</td></tr>";
    return [];
  }
}

//Edit discounts
let currentDiscountId = null;

async function editDiscount(discountId) {
  if(!discountId) return;
  try {
    currentDiscountId = discountId;

    const response = await fetch(`/api/items/discounted/${discountId}`);
    if (!response.ok) throw new Error("Failed to fetch discount details.");

    const discount = await response.json();

    document.getElementById("edit-discount-percentage").value =
      discount.discount_percentage;
    document.getElementById("edit-discount-valid-until").value =
      discount.discount_valid_until;

    showModal(editDiscountModal);
  } catch (error) {
    console.error("Error fetching discount details: ", error);
    alert("Failed to load discount details.");
  }
}

editDiscountForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const discountPercentage = parseFloat(
    document.getElementById("edit-discount-percentage").value
  );
  const validUntil = document.getElementById("edit-discount-valid-until").value;

  if (
    isNaN(discountPercentage) ||
    discountPercentage <= 0 ||
    discountPercentage > 100
  ) {
    alert("Please enter a valid discount percentage (1-100).");
    return;
  }
  if (!validUntil) {
    alert("Please specify a valid end date.");
    return;
  }
  try {
    // Send updated discount to the server
    const response = await fetch("/api/update-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: currentDiscountId,
        discount_percentage: discountPercentage,
        validUntil,
      }),
    });

    if (!response.ok) throw new Error("Failed to update discount.");

    console.log("Discount updated successfully!");
    alert("Discount updated successfully!");

    // Close modal and refresh discount table
    hideModal(editDiscountModal);
    const discounts = await fetchDiscounts();
    populateDiscountTable(discounts);
  } catch (error) {
    console.error("Error updating discount:", error);
    alert("Failed to update discount. Please try again.");
  }
});

//Close Edit Discount modal
document
  .getElementById("close-edit-discount-modal")
  .addEventListener("click", () => {
    hideModal(editDiscountModal);
  });

// Close modal logic
document
  .getElementById("close-discount-modal")
  .addEventListener("click", () => {
    hideModal(discountModal);
  });

// Open discount modal for item
document.querySelectorAll(".apply-discount-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    showModal(discountModal);
  });
});

//Open category discount modal
document
  .getElementById("apply-category-discount-btn")
  .addEventListener("click", () => {
    const categoryId = document.getElementById("current-category-header")
      .dataset.categoryId;

    if (!categoryId) {
      alert("Please select a category before applying a discount.");
      return;
    }

    discountForm.dataset.type = "category";
    discountForm.dataset.categoryId = categoryId;

    showModal(discountModal);
  });

// Close modal when clicking the close button
document
  .getElementById("close-discount-modal")
  .addEventListener("click", () => {
    discountForm.reset();
    hideModal(discountModal);
  });

// Close modal when clicking outside of it
window.onclick = (event) => {
  if (event.target === discountModal) {
    hideModal(discountModal);
  }
};

//Remove a discount
async function removeDiscount(discountId) {
  if(!discountId){
    console.error("Invalid discount ID: ", discountId);
    alert("Failed to identify this discount. Please try again later.");
    return;
  }
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
        discountPercentage: null, //Reset discount
        validUntil: null, //Reset validity
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json(); // Get server error message
      console.error("Failed to remove discount:", errorDetails);
      throw new Error(`Failed to remove discount: ${errorDetails.error}`);
    }
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
  categories.sort((a, b) => a.name.localeCompare(b.name));
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

async function openEditModal(product) {
  const form = document.getElementById("edit-item-form");
  try {
    //Fetch necessary details from the database
    console.log(product.id);
    const dbResponse = await fetch(`/api/items/${product.id}/psdb`);
    if (!dbResponse.ok)
      throw new Error("Failed to fetch product data from the database.");
    const dbData = await dbResponse.json();

    //Prefill Clover Fields
    document.getElementById("edit-item-name").value = product.name;
    document.getElementById("edit-item-price").value = (
      product.price / 100
    ).toFixed(2);
    document.getElementById("edit-item-stock").value = product.available;

    //Prefill Additional Fields from database
    document.getElementById("edit-item-description").value =
      dbData.description || "";
    document.getElementById("edit-item-tags").value = dbData.tags
      ? dbData.tags.join(",")
      : "";
    document.getElementById("edit-item-color").value = dbData.color || "";
    document.getElementById("edit-item-size").value = dbData.size || "";
    document.getElementById("edit-item-featured").value = dbData.is_featured
      ? "true"
      : "false";

    //Store prodId for submission
    form.dataset.productId = product.id;

    //Show the modal
    showModal(editModal);
  } catch (error) {
    console.error("Error opening edit modal: ", error);
    alert(
      "Failed to load item details. Please refresh the page and try again."
    );
  }
}

document.getElementById("close-edit-modal").addEventListener("click", () => {
  hideModal(editModal);
});
window.onclick = (event) => {
  if (event.target === editModal) {
    hideModal(editModal);
  }
};

document
  .getElementById("edit-item-form")
  .addEventListener("submit", async (e) => {
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
      is_featured:
        document.getElementById("edit-item-featured").value === "true", // New field
      image_url: document.getElementById("edit-item-image").value,
      category_id: document.getElementById("current-category-header").dataset
        .categoryId,
    };

    try {
      //Step 1 for updating clover item
      const cloverFields = {
        name: updatedProduct.name,
        price: updatedProduct.price,
        available: updatedProduct.available,
      };

      const cloverResponse = await fetch(`/api/items/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cloverFields),
      });

      if (!cloverResponse.ok) {
        throw new Error("Failed to update product in Clover");
      }

      console.log("Product updated successfully in Clover!");

      //Step 2 for updating database with additional fields
      const dbResponse = await fetch(`/api/items/${productId}/psdb`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!dbResponse.ok) {
        throw new Error("Failed to update product in Database...");
      }

      console.log("Product updated successfully in database!");

      //Step 3 for updating and refreshing ui and populating items original category
      hideModal(editModal);
      const currentCategoryId = document.getElementById(
        "current-category-header"
      ).dataset.categoryId;
      const items = await fetchItems(currentCategoryId);
      populateProductTable(items);
    } catch (error) {
      console.error("Error updating product: ", error);
      alert(`Error updating product: ${error.message}`);
    }
  });

async function deleteProduct(productId) {
  try {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    const response = await fetch(`/api/items/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete product");
    console.log("Product deleted successfully!");
    //refresh product table
    const currentCategoryId = document.getElementById("current-category-header")
      .dataset.categoryId;
    const items = await fetchItems(currentCategoryId);
    populateProductTable(items);
  } catch (error) {
    console.error("Error deleting product: ", error);
    alert("Failed to delete the product. Please try again.");
  }
}

//Open add product modal
document.getElementById("add-product-btn").addEventListener("click", () => {
  addProductForm.reset();
  showModal(addProductModal);
});
//Close add product modal
document.getElementById("close-add-modal").addEventListener("click", () => {
  hideModal(addProductModal);
});
window.onclick = (event) => {
  if (event.target === addProductModal) {
    hideModal(addProductModal);
  }
};

document
  .getElementById("add-product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoryId = document.getElementById("current-category-header")
      .dataset.categoryId;
    const categoryName =
      document.getElementById("current-category").textContent;

    const newProduct = {
      name: document.getElementById("add-product-name").value,
      price: Math.round(
        parseFloat(document.getElementById("add-product-price").value) * 100
      ),
      available: document.getElementById("add-product-stock").value === "true",
      description: document.getElementById("add-product-description").value,
      tags: document.getElementById("add-product-tags").value.split(","),
      color: document.getElementById("add-product-color").value,
      size: document.getElementById("add-product-size").value,
      is_featured:
        document.getElementById("add-product-featured").value === "true",
      image_url: document.getElementById("add-product-image").value,
      category_id: categoryId,
      category: document.getElementById("current-category").textContent,
    };

    try {
      const cloverFields = {
        name: newProduct.name,
        price: newProduct.price,
        available: newProduct.available,
        categories: [
          {
            id: categoryId,
            name: categoryName,
          },
        ],
      };

      const cloverResponse = await fetch("/api/items", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(cloverFields),
      });

      if (!cloverResponse.ok)
        throw new Error("Failed to add product to Clover!");

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

      if (!dbResponse.ok)
        throw new Error("Failed to add product to database...");

      console.log("Product successfully added to the database!");

      //Close modal and refresh product table
      hideModal(addProductModal);
      const items = await fetchItems(categoryId);
      populateProductTable(items);
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add the product. Please try again.");
    }
  });

function populateProductTable(products) {
  if (!productTableBody) return;

  productTableBody.innerHTML = ""; // Clear existing rows

  if (!products || products.length === 0) {
    //Display message when no products are available
    const noItemsRow = document.createElement("tr");
    noItemsRow.innerHTML = `<td colspan="4" style="text-align: center;">No products found. Please select a category from above.</td>`;
    productTableBody.appendChild(noItemsRow);
    return;
  }
  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.available ? "In Stock" : "Out of Stock"}</td> 
            <td>$${(product.price / 100).toFixed(2)}</td>
            <td>
                <button class="product-action-btn edit" data-product='${JSON.stringify(
                  product
                )}'>Edit</button>
                <button class="product-action-btn delete" data-id="${
                  product.id
                }">Delete</button>
                <button class="product-action-btn discount apply-discount-btn" data-id="${
                  product.id
                }">Discount</button>
            </td>
        `;
    productTableBody.appendChild(row);
  });
}

async function refreshDiscountTable(){
  const discounts = await fetchDiscounts();
  populateDiscountTable(discounts);
}

function populateDiscountTable(discounts) {
  if (!discountTableBody) return;

  discountTableBody.innerHTML = ""; // Clear existing rows
  if (!discounts || discounts.length === 0) {
    //displays message if there's no discounts available
    const noItemsRow = document.createElement("tr");
    noItemsRow.innerHTML = `<td colspan="4" style="text-align: center">There are currently no active discounts to display. You can apply discounts using the product management table.</td>`;
    discountTableBody.appendChild(noItemsRow);
    return;
  }
  discounts.forEach((discount) => {
    console.log("Processing discount:", discount.name);
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${discount.name}</td>
            <td>${discount.discount_percentage}%</td>
            <td>${new Date(
              discount.discount_valid_until
            ).toLocaleDateString()}</td>
            <td>
                <button class="product-action-btn edit" data-id="${
                  discount.id
                }">Edit</button>
                <button class="product-action-btn delete" data-id="${
                  discount.id
                }">Remove</button>
            </td>
        `;
    discountTableBody.appendChild(row);
  });
}

document.getElementById("refresh-discounts-btn").addEventListener("click", async () => {
  const button = document.getElementById("refresh-discounts-btn");
  button.disabled = true;
  button.textContent = "Refreshing...";
  try{
    await refreshDiscountTable();
    button.textContent = "Refresh Discounts";
  }catch(error){
    console.error("Error refreshing discounts: ", error);
    button.textContent = "Error! Try Again.";
  } finally {
    button.disabled = false;
  }
});

discountTableBody.addEventListener("click", (e) => {
  const discountId = e.target.dataset.id;
  if (e.target.classList.contains("edit")) {
    editDiscount(discountId);
  } else if (e.target.classList.contains("delete")) {
    removeDiscount(discountId);
  }
});

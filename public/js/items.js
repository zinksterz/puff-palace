const vapesId = "YJ8B07QX4QPVE";
const cbdId = "RM4BW28ZKH8SA";
const papersId = "5PST1Y4VP8DGC";
const glasswareId = "RM4BW28ZKH8SA";
const hookahId = "2W6EQJWZVXV1J";

async function waitForServerReady(retries = 10, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`http://localhost:3000/api/ping`);
      if (response.ok) return true;
    } catch (error) {
      console.log(`Server not ready. Retry ${attempt}...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error(`Server did not respond after multiple attempts`);
}

async function displayItems(containerSelector, categoryId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/category/${categoryId}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const items = await response.json();
    const itemsContainer = document.querySelector(
      `${containerSelector} .item-list`
    );
    console.log(containerSelector);
    console.log(document.querySelector(`${containerSelector} .item-list`));
    itemsContainer.innerHTML = "";

    items.forEach((item) => {
      //item card
      const itemCard = document.createElement("div");
      itemCard.classList.add("item-card");
      itemCard.classList.add("item");
      itemCard.addEventListener("click", () => {
        console.log("Item clicked: ", item.id);
        fetchProductDetails(item.id);
      });

      //item image
      const itemImage = document.createElement("img");
      itemImage.classList.add("item-image");
      itemImage.src = "imgs/pp_ss.JPG";
      itemImage.alt = item.name;

      //item info container
      const itemInfo = document.createElement("div");
      itemInfo.classList.add("item-info");

      //item name
      const itemName = document.createElement("p");
      itemName.classList.add("item-name");
      itemName.textContent = item.name;

      //item price
      const itemPrice = document.createElement("p");
      itemPrice.classList.add("item-price");
      itemPrice.textContent = `$${(item.price / 100).toFixed(2)}`;

      //Check for discounts
      if (item.isDiscounted) {
        const saleTagEmoji = document.createElement("div");
        saleTagEmoji.classList.add("sale-tag-emoji");
        saleTagEmoji.textContent = "🔥";
        itemPrice.append(saleTagEmoji);
      }

      //appendElements to item info/ item card
      itemInfo.append(itemName, itemPrice);
      itemCard.append(itemImage, itemInfo);

      //append to container
      itemsContainer.appendChild(itemCard);
    });
  } catch (error) {
    console.error("Error displaying items: ", error);
  }
}

async function fetchProductDetails(productId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/product/${productId}`
    );
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    const product = await response.json();
    displayProductModal(product);
  } catch (error) {
    console.error("Error fetching product details: ", error);
  }
}

function displayProductModal(product) {
  const modal = document.getElementById("product-modal");

  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-image").src =
    product.imageUrl || `./imgs/pp_ss.JPG`;
  document.getElementById("modal-description").textContent =
    product.description || "No description is available for this product...";
  document.getElementById("modal-price").textContent = `$${(
    product.price / 100
  ).toFixed(2)}`;

  const modalContent = document.querySelector(".modal-content");
  let saleTag = document.querySelector(".sale-tag-modal");

  //Check if product on sale
  if (product.isDiscounted) {
    if (!saleTag) {
      saleTag = document.createElement("div");
      saleTag.classList.add("sale-tag-modal");
      saleTag.textContent = "SALE";
      modalContent.prepend(saleTag);
    }
    saleTag.style.display = "block";
  } else if (saleTag) {
    saleTag.style.display = "none";
  }

  //show modal
  modal.classList.remove("hidden");

  //collapse modal
  document.querySelector(".close-button").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}


//Checks for admin priviledges against array of secure admin emails
async function adminIsUser(){
  console.log("Checking admin status...");
  try{
    const response = await fetch("/api/is-admin");
    const result = await response.json();

    if (response.ok){
      console.log("Admin check result: ", result);
      return result.isAdmin;
    } else {
      console.warn(result.message || "Access Denied!");
      return false;
    }
  } catch(error){
    console.error("Error checking admin status: ", error);
    return false;
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    await waitForServerReady();
    displayItems("#vapes-category", vapesId);
    displayItems("#cbd-category", cbdId);
    displayItems("#papers-category", papersId);
    displayItems("#glassware-category", glasswareId);
    displayItems("#hookah-category", hookahId);
  } catch (error) {
    console.error("Failed to intialize the application:", error);
  }
});

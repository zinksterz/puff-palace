const vapesId = "YJ8B07QX4QPVE";
const cbdId = "RM4BW28ZKH8SA";
const papersId = "5PST1Y4VP8DGC";

async function displayItems(containerSelector, categoryId) {
  try {
    const response = await fetch(`http://localhost:3000/api/category/${categoryId}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const items = await response.json();
    const itemsContainer = document.querySelector(`${containerSelector} .item-list`);
    console.log(containerSelector);
    console.log(document.querySelector(`${containerSelector} .item-list`));
    itemsContainer.innerHTML = "";

    items.forEach((item) => {
      //item card
      const itemCard = document.createElement("div");
      itemCard.classList.add("item-card");
      itemCard.addEventListener("click", () =>
        fetchProductDetails(item.id));

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

function displayProductModal(product){
    const modal = document.getElementById("product-modal");

    document.getElementById("modal-title").textContent = product.name;
    document.getElementById("modal-image").src = product.imageUrl || `./imgs/pp_ss.JPG`;
    document.getElementById("modal-description").textContent = product.description || "No description is available for this product...";
    document.getElementById("modal-price").textContent = `$${(product.price /100).toFixed(2)}`;

    //show modal
    modal.classList.remove("hidden");

    //collapse modal
    document.querySelector(".close-button").addEventListener("click",()=>{
        modal.classList.add("hidden");
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    displayItems("#vapes-category", vapesId);
    displayItems("#cbd-category", cbdId);
    displayItems("#papers-category", papersId);
});
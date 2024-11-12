const vapesId = "YJ8B07QX4QPVE";

async function displayVapesItems() {
    try{
        const response = await fetch('http://localhost:3000/api/vapes');
        if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const items = await response.json();
        const vapesContainer = document.querySelector("#vapes-category .item-list");
        vapesContainer.innerHTML = '';

        items.forEach(item => {
            //item card
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');

            //item image
            const itemImage = document.createElement('img');
            itemImage.classList.add('item-image');
            itemImage.src = 'imgs/pp_ss.JPG';
            itemImage.alt = item.name;

            //item info container
            const itemInfo = document.createElement('div');
            itemInfo.classList.add('item-info');

            //item name
            const itemName = document.createElement('p');
            itemName.classList.add('item-name');
            itemName.textContent = item.name;

            //item price
            const itemPrice = document.createElement('p');
            itemPrice.classList.add('item-price');
            itemPrice.textContent = `$${(item.price / 100).toFixed(2)}`;

            //appendElements to item info/ item card
            itemInfo.append(itemName, itemPrice);
            itemCard.append(itemImage, itemInfo);

            //append to container
            vapesContainer.appendChild(itemCard);

        });
    }
    catch(error){
        console.error("Error displaying vape items: ", error);
    }
}

document.addEventListener('DOMContentLoaded', displayVapesItems);
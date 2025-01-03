document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll(".category-container");

  containers.forEach((container) => {
    const itemList = container.querySelector(".item-list");
    const leftButton = container.querySelector(".scroll-button.left");
    const rightButton = container.querySelector(".scroll-button.right");
    const itemWidth = itemList.firstElementChild?.clientWidth || 200;//Fallback width
    const itemsToScroll = 3;
    const scrollDistance = itemWidth * itemsToScroll;

    function toggleButtonVisibility() {
      const scrollLeft = itemList.scrollLeft;
      const maxScrollLeft = itemList.scrollWidth - itemList.clientWidth;
      leftButton.style.display = scrollLeft > 10 ? "block" : "none";
      rightButton.style.display = scrollLeft < maxScrollLeft ? "block" : "none";
    }

    toggleButtonVisibility();

    itemList.addEventListener("scroll", toggleButtonVisibility);

    leftButton.addEventListener("click", () => {
      applyWaveEffect(itemList);
      itemList.scrollBy({ left: -scrollDistance, behavior: "smooth" });
    });
    rightButton.addEventListener("click", () => {
      applyWaveEffect(itemList);
      itemList.scrollBy({ left: scrollDistance, behavior: "smooth" });
    });
  });

  function applyWaveEffect(container){
    const items = container.querySelectorAll(".item");
    items.forEach((item,index) =>{
      item.style.transition = "transform 0.5s ease, opacity 0.5s ease";
      item.style.transform = "scale(0.9)";
      item.style.opacity = "0.8";
      setTimeout(() => {
        item.style.transform = "scale(1)";
        item.style.opacity = "1";
      }, index * 50); //stagger delay
    });
  }
});

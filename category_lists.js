document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll(".category-container");

  containers.forEach((container) => {
    const itemList = container.querySelector(".item-list");
    const leftButton = container.querySelector(".scroll-button.left");
    const rightButton = container.querySelector(".scroll-button.right");

    function toggleButtonVisibility() {
      const scrollLeft = itemList.scrollLeft;
      const maxScrollLeft = itemList.scrollWidth - itemList.clientWidth;

      if (itemList.scrollWidth <= itemList.clientWidth) {
        leftButton.style.display = "none";
        rightButton.style.display = "none";
      } else {
        leftButton.style.display = scrollLeft > 0 ? "block" : "none";
        rightButton.style.display =
          scrollLeft < maxScrollLeft ? "block" : "none";
      }
    }

    toggleButtonVisibility();

    itemList.addEventListener("scroll", toggleButtonVisibility);

    leftButton.addEventListener("click", () => {
      itemList.scrollBy({ left: -200, behavior: "smooth" });
    });
    rightButton.addEventListener("click", () => {
      itemList.scrollBy({ left: 200, behavior: "smooth" });
    });
  });
});

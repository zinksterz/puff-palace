const scrollButtons = document.querySelectorAll(".scroll-button");

function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "flex";
}

function hideSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "none";
}

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const container = button.parentElement.querySelector(".item-list");
    const scrollAmount = 200; // Adjust the amount to scroll
    container.scrollBy({
      left: button.classList.contains("left") ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  });
});

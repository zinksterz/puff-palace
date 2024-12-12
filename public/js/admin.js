//Checks to ensure user is an admin while on admin panel
document.addEventListener("DOMContentLoaded", async () => {
  const isAdmin = await adminIsUser();
  if (!isAdmin) {
    window.location.href = "/"; // Redirect to home if not admin
  }
  updateTotalProducts();
});

async function updateTotalProducts(){
  try{
    const response = await fetch("/api/total-products");
    if(!response.ok) throw new Error("Failed to fetch total products count...");
    const {totalProducts} = await response.json();
    document.getElementById("total-products").textContent = totalProducts;
  } catch(error){
    console.error("Error updating total products: ", error);
  }
}

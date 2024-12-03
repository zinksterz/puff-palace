//Checks to ensure user is an admin while on admin panel
document.addEventListener("DOMContentLoaded", async () => {
  const isAdmin = await adminIsUser();
  if (!isAdmin) {
    window.location.href = "/"; // Redirect to home if not admin
  }
});

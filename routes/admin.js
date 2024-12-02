const express = require("express");
const router = express.Router();
require("dotenv").config();


//auth0 secure admin route
router.get("/admin", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const roles = req.oidc.user[`https://${process.env.AUTH_DOMAIN}/roles`];
    if(roles && roles.includes('admin')){
      res.send(`Welcome, Admin! ${req.oidc.user.name}`);
    }
    else{
      res.status(403).send('Access Denied. Admins only.');
    }
  } else {
    res.redirect("/login");
  }
});

//Logic to discuont or remove discount from an item
router.post("/update-discount", async (req, res) => {
  const { itemId, isDiscounted } = req.body;

  try {
    //update discount status statefully
    console.log(`Updating item ${itemId} to isDiscounted: ${isDiscounted}`);
    res.status(200).json({ message: "Item discount updated successfully." });
  } catch (error) {
    console.error(
      "There was an issue updating the items discount status: ",
      error.message
    );
    res.status(500).json({ error: "Failed to update discount." });
  }
});

module.exports = router;
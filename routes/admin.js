const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
require("dotenv").config();


//auth0 secure admin route
router.get("/admin", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const userRole = req.oidc.user.role || "unknown"; // Handle missing role
    const userName = req.oidc.user.name || "Unknown User"; // Handle missing name
    console.log("User role: " + userRole);
    if (userRole === "admin") {
      logger.info(`${userName} logged in as an admin.`);
      return res.send(`Welcome, Admin! ${userName}`);
    } else {
      logger.warn(
        `${userName} attempted to access admin but has an invalid role: ${userRole}`
      );
      return res.status(403).send("Access Denied: Insufficient permissions.");
    }
  } else {
    logger.warn("Unauthenticated access attempt to admin route.");
    return res.status(401).redirect("/login");
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
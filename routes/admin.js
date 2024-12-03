const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
require("dotenv").config();


//auth0 secure admin route
router.get("/admin", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    logger.info(`${req.oidc.user.name} has accessed /admin.`);
    const userName = req.oidc.user.name || "Unknown User"; // Handle missing name
    if (req.oidc.user.email === "z.j.inkster@gmail.com") { // Update for client admin control
      logger.info(`${userName} logged in as an admin.`);
      res.redirect("/");
    } else {
      logger.warn(`${userName} attempted to access admin but has an invalid email: ${req.oidc.user.email}`);
      return res.status(403).send("Access Denied: Insufficient permissions.");
    }
  } else {
    logger.warn("Unauthenticated access attempt to admin route.");
    return res.status(401).redirect("/api/auth/login");
  }
});

router.get("/is-admin", (req, res) =>{
  if(!req.oidc.isAuthenticated()){
    return res.status(401).json({isAdmin: false, message:"Not authenticated"});
  }
  const userEmail = req.oidc.user.email;
  const adminEmails = process.env.ADMIN_EMAILS;
  const isAdmin = adminEmails.includes(userEmail);

  if(isAdmin){
    res.json({isAdmin:true});
  } else {
    res.status(403).json({ isAdmin: false, message: "Access Denied"});
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
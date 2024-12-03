const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

//auth0 display user profile
router.get("/profile", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const userName = req.oidc.user.name || "Unknown User";
    logger.info(`${userName} logged in.`);
    res.json({
      name: userName,
      email: req.oidc.user.email || "Email not available",
      picture: req.oidc.user.picture || "Picture not available",
    });
  } else {
    logger.warn(`Unauthenticated access to /profile.`);
    res.status(401).send("Not authenticated.");
  }
});

// Placeholder for user settings (future iteration)
router.get("/settings", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json({ message: "User settings endpoint (to be implemented)." });
  } else {
    res.status(401).send("Not authenticated.");
  }
});

module.exports = router;
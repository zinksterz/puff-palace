const express = require("express");
const router = express.Router();

//auth0 display user profile
app.get("/profile", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json(req.oidc.user);
  } else {
    res.status(401).send("Not logged in");
  }
});

module.exports = router;
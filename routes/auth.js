const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

//Auth0 login 
router.get("/login", (req, res) => {
    if(req.oidc.isAuthenticated()){
        res.redirect("/");
    }else{
        res.oidc.login(); // Redirects to Auth0 login page
    }
});

//Auth0 logout
router.get("/logout", (req, res) => {
  res.oidc.logout({ returnTo: "http://localhost:3000" }); // Adjust returnTo for your app's URL
});

router.get("/callback", (req, res) => {
    console.log("User is apparently authenticated auth.js line 16");
  if (req.oidc.isAuthenticated()) {
    // logger.info("User is authenticated:", req.oidc.user);
    console.log("User authenticated", req.oidc.user);
    res.redirect("/");
  } else {
    logger.error("Authentication failed.");
    res.redirect("/login");
  }
});

module.exports = router;
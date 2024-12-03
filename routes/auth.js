const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
require("dotenv").config();

//Auth0 login
router.get("/login", (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    logger.info("User is not authenticated. Redirecting to Auth0 login...");
    res.oidc.login();
  } else {
    logger.info(`User is already authenticated. Redirecting to .../callback`);
    res.redirect("/api/auth/callback");
  }
});

//Auth0 logout
router.get("/logout", (req, res) => {
  logger.info(`User logged out. Redirecting to home page...`);
  res.oidc.logout({ returnTo: "http://localhost:3000" }); // Adjust returnTo for your app's URL
});

//callback routing for admin || user view
router.get("/callback", (req, res) => {
  logger.info("/callback route hit...");
  //Here we need to update the admin account with client credentials
  if (req.oidc.isAuthenticated()) {
    const user = req.oidc.user;
    logger.info("User authenticated as ", user);
    //email list of accepted admins
    const adminEmails = process.env.ADMIN_EMAILS.split(",");
    if (adminEmails.includes(user.email)) {
      logger.info(
        `${user.name} authenticated as admin. Redirecting to admin panel...`
      );
      res.redirect("/api/admin");
    } else {
      logger.info(
        `${user.name} authenticated as basic user. Redirecting to home...`
      );
      return res.redirect("/");
    }
  } else {
    logger.error("Authentication failed. Redirecting user to /login...");
    res.redirect("/api/auth/login");
  }
});

module.exports = router;

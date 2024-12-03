require("dotenv").config();
const { auth } = require("express-openid-connect");

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: "http://localhost:3000",
  clientID: process.env.AUTH_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH_DOMAIN}`,
};

const authMiddleware = auth(authConfig);

module.exports = authMiddleware;

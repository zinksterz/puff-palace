const express = require("express");
const router = express.Router();




//check for server readiness
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

module.exports = router;
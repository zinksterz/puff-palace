const express = require("express");
const logger = require("../utils/logger");

const router = express.Router();

//check for server readiness
router.get("/ping", (req, res) => {
    logger.info("Ping endpoint accessed");
    res.status(200).send("pong");
});

module.exports = router;
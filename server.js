require("dotenv").config();
const express = require("express");
const { getMerchantData } = require("./clover_api");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/merchant", async (req, res) => {
    console.log("Route /api/merchant accessed");
  try {
    //fetch data from api
    const data = await getMerchantData();
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch merchant data:", error.message);
    res.status(500).json({ error: "Failed to fetch merchant data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

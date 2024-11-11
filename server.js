require("dotenv").config();
const express = require("express");
const { getMerchantData } = require("./clover_api");
const { getItemsByCategory } = require("./clover_api.js");
const app = express();
const PORT = process.env.PORT || 3000;

//gets merchant single store
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

//get items by category id
app.get("/api/vapes", async (req, res)=>{
  const vapeCategoryId = "YJ8B07QX4QPVE";
  try{
    const items = await getItemsByCategory(vapeCategoryId);
    res.json(items);
  }
  catch(error){
    res.status(500).json({error: "Failed to fetch vape items"});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

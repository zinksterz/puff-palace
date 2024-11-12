require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getMerchantData, getItemsByCategory } = require("./clover_api");
const app = express();
app.use(cors());
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
  console.log("Route /api/vapes accessed");
  const vapeCategoryId = "RM4BW28ZKH8SA";
  console.log("Fetching items for category ID: ", vapeCategoryId);
    try{
    const items = await getItemsByCategory(vapeCategoryId);
    res.json(items);
  }
  catch(error){
    console.error("Failed to fetch vape items: ", error);
    res.status(500).json({error: "Failed to fetch vape items"});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

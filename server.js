require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getMerchantData, getItemsByCategory, fetchProductDetails } = require("./clover_api");
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

app.get("/api/category/:id", async (req, res) =>{
  console.log(`Route /api/category/${req.params.id} accessed`);
  const categoryId = req.params.id;
  console.log(`Fetching items for category ID: ${req.params.id}`);
  try{
    const items = await getItemsByCategory(categoryId);
    res.json(items);
  }
  catch(error){
    console.error("Failed to fetch items in category:", error.message);
    res.status(500).json({error: "Failed to fetch category items"});
  }
});

app.get(`/api/product/:id`, async(req, res)=>{
  console.log(`Route /api/product/${req.params.id} accessed`);
  const productId = req.params.id;
  console.log(`Fetching product of id: ${productId}`);
  try{
    const product = await fetchProductDetails(productId);
    res.json(product);
    console.log("Product fetched: ", product);
  }
  catch(error){
    console.error("Failed to fetch product details: ", error.message);
    res.status(500).json({error: "Failed to fetch product details"});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

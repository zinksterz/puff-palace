require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  getMerchantData,
  getItemsByCategory,
  fetchProductDetails,
} = require("./clover_api");
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

//check for server readiness
app.get("/api/ping", (req, res)=>{
  res.status(200).send("pong");
});

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

app.get("/api/category/:id", async (req, res) => {
  console.log(`Route /api/category/${req.params.id} accessed`);
  const categoryId = req.params.id;
  console.log(`Fetching items for category ID: ${req.params.id}`);
  try {
    const items = await getItemsByCategory(categoryId);
    res.json(items);
  } catch (error) {
    console.error("Failed to fetch items in category:", error.message);
    res.status(500).json({ error: "Failed to fetch category items" });
  }
});

app.get(`/api/product/:id`, async (req, res) => {
  console.log(`Route /api/product/${req.params.id} accessed`);
  const productId = req.params.id;
  console.log(`Fetching product of id: ${productId}`);
  try {
    const product = await fetchProductDetails(productId);
    res.json(product);
    console.log("Product fetched: ", product);
  } catch (error) {
    console.error("Failed to fetch product details: ", error.message);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

//Logic to discuont or remove discount from an item 
app.post("/api/update-discount", async (req, res) =>{
  const {itemId, isDiscounted} = req.body;

  try{
    //update discount status statefully
    console.log(`Updating item ${itemId} to isDiscounted: ${isDiscounted}`);
    res.status(200).json({message: "Item discount updated successfully."});
  }
  catch (error) { 
    console.error("There was an issue updating the items discount status: ", error.message);
    res.status(500).json({error: "Failed to update discount."});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

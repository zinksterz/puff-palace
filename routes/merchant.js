const express = require("express");
const router = express.Router();
const { getMerchantData, getItemsByCategory, fetchProductDetails } = require("../clover_api");

//gets merchant single store
router.get("/merchant", async (req, res) => {
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

//Get items by category id
router.get("/category/:id", async (req, res) => {
  const categoryId = req.params.id;
  console.log(`Fetching items for category ID: ${categoryId}`);
  try {
    const items = await getItemsByCategory(categoryId);
    res.json(items);
  } catch (error) {
    console.error("Failed to fetch items in category:", error.message);
    res.status(500).json({ error: "Failed to fetch category items" });
  }
});

//Get item by product id
router.get(`/product/:id`, async (req, res) => {
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


module.exports = router;
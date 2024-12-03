const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const { getMerchantData, getItemsByCategory, fetchProductDetails } = require("../clover_api");

//gets merchant single store
router.get("/merchant", async (req, res) => {
  logger.info("Merchant endpoint accessed");
  try {
    //fetch data from api
    const data = await getMerchantData();
    logger.info(`Fetched ${data.name} merchant`);
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch merchant data:", error.message);
    res.status(500).json({ error: "Failed to fetch merchant data" });
  }
});

//Get items by category id
router.get("/category/:id", async (req, res) => {
  logger.info("Category endpoint accessed");
  const categoryId = req.params.id;
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
  logger.info("Product endpoint accessed");
  const productId = req.params.id;
  try {
    const product = await fetchProductDetails(productId);
    res.json(product);
    logger.info("Product fetched: ", product);
  } catch (error) {
    logger.error("Failed to fetch product details: ", error.message);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});


module.exports = router;
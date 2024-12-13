const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const {Product} = require("../models");
const {
  getMerchantData,
  getItemsByCategory,
  fetchProductDetails,
  getAllCategories,
  getItems,
  fetchAllItems,
} = require("../clover_api");


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

//Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await getAllCategories();
    logger.info(`Fetched list of categories from merchant...`);
    res.json(categories);
  } catch (error) {
    logger.error("Failed to fetch list of categories: ", error);
    res.status(500).json({ error: "Failed to fetch categories..." });
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

//Get all items from merchant
router.get("/items", async (req, res) => {
  logger.info("/items endpoint accessed");
  try {
    const items = await getItems();
    res.json(items);
  } catch (error) {
    console.error("error fetching all items: ", error.message);
    res.status(500).json({ error: "Failed to fetch items" });
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

//Populate database with items from Clover's api
router.post("/populate-items", async (req, res) => {
  try {
    logger.info("Fetching items from Clover API for db...");
    const cloverItems = await fetchAllItems();
    logger.info(`Fetched ${cloverItems.length} items. Transforming...`);
    
    //transform Clover items to match db schema
    const transformedItems = cloverItems.map((item) => ({
      id: item.id,
      name: item.name || "Unnamed Product",
      description: "This item does not have a description, yet.",
      price: item.price || 0,
      available: item.available || false,
      image_url: item.imageUrl || null,
      category: item.categories?.[0]?.name || "Uncategorized",
      category_id: item.categories?.[0]?.id || null,
      tags: item.tags || [],
      is_featured: false,
      price_discounted: null,
      discount_percentage: null,
      weight: null,
      dimensions: null,
      rating: 0,
      views_count: 0,
      purchase_count: 0,
      color: null,
      size: null,
    }));
    
    console.log("Inserting transformed items into the database...");
    //Bulk insertion of items into database
    await Product.bulkCreate(transformedItems, {ignoreDuplicates: true});

    console.log("Items successfully populated into the database!");
    res.status(200).json({message: "Database populated successfully.", itemCount: transformedItems.length});
  }catch(error){
    console.error("Error populating database: ", error.message);
    res.status(500).json({error: "Failed to populate the database"});
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const { getCachedTotalProducts } = require("../utils/cacheHandler");
const {
  updateItemInDatabase,
  deleteItemFromDatabase,
  addItemToDatabase,
  addItemToCategory,
} = require("../clover_api");
const { Product } = require("../models");
require("dotenv").config();

//temporary in-memory discount storage to be replaced by database
const discounts = [
  { id: 1, product: "CBD Oil", discount: "20%", validUntil: "2024-12-31" },
  { id: 2, product: "Vape Pen", discount: "10%", validUntil: "2024-12-15" },
];

//auth0 secure admin route
router.get("/admin", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    logger.info(`${req.oidc.user.name} has accessed /admin.`);
    const userName = req.oidc.user.name || "Unknown User"; // Handle missing name
    if (req.oidc.user.email === "z.j.inkster@gmail.com") {
      // Update for client admin control
      logger.info(`${userName} logged in as an admin.`);
      res.redirect("/");
    } else {
      logger.warn(
        `${userName} attempted to access admin but has an invalid email: ${req.oidc.user.email}`
      );
      return res.status(403).send("Access Denied: Insufficient permissions.");
    }
  } else {
    logger.warn("Unauthenticated access attempt to admin route.");
    return res.status(401).redirect("/api/auth/login");
  }
});

//checks to ensure account accessing is indeed admin
router.get("/is-admin", (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(401)
      .json({ isAdmin: false, message: "Not authenticated" });
  }
  const userEmail = req.oidc.user.email;
  const adminEmails = process.env.ADMIN_EMAILS;
  const isAdmin = adminEmails.includes(userEmail);

  if (isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.status(403).json({ isAdmin: false, message: "Access Denied" });
  }
});

//Logic to discuont or remove discount from an item
router.post("/update-discount", async (req, res) => {
  const { itemId, isDiscounted } = req.body;

  try {
    //update discount status statefully
    console.log(`Updating item ${itemId} to isDiscounted: ${isDiscounted}`);
    res.status(200).json({ message: "Item discount updated successfully." });
  } catch (error) {
    console.error(
      "There was an issue updating the items discount status: ",
      error.message
    );
    res.status(500).json({ error: "Failed to update discount." });
  }
});

//Logic for adding a discount
router.post("/discounts", (req, res) => {
  try {
    const { product, discount, validUntil } = req.body;

    //validation
    if (!product || !discount || !validUntil) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing one or more required fields...",
        });
    }
    const newDiscount = {
      id: discounts.length + 1,
      product,
      discount,
      validUntil,
    };

    discounts.push(newDiscount);
    res.json({ success: true, discount: newDiscount });
  } catch (error) {
    console.error("Error creating discount: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create new discount..." });
  }
});

//Fetching a list of Discounted items
router.get("/discounts", (req, res) => {
  try {
    res.json({ success: true, discounts });
  } catch (error) {
    console.error("Error fetching discounts: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch discounts..." });
  }
});

//adding new items
router.post("/items", async (req, res) => {
  const { name, price, available, categories } = req.body;

  try {
    const newItem = {
      name,
      price,
      available,
      categories,
    };
    const createdItem = await addItemToDatabase(newItem);
    const categoryId = categories[0]?.id;
    if (categoryId) {
      await addItemToCategory(createdItem.id, categoryId);
    }
    res.status(201).json(createdItem);
  } catch (error) {
    console.error("Error adding new item:", error);
    res.status(500).json({ error: "Failed to add new item" });
  }
});

//updating item details
router.put("/items/:id", async (req, res) => {
  const itemId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedItem = await updateItemInDatabase(itemId, updatedData);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(`Error updating item ${itemId}: `, error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

//removing item
router.delete("/items/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    const result = await deleteItemFromDatabase(itemId);
    res
      .status(200)
      .json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error(`Error deleting item ${itemId}: `, error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

//views for admin specific stats (revenue/active discounts/etc)
//Total Products
router.get("/total-products", (req, res) => {
  try {
    const totalProducts = getCachedTotalProducts();
    res.json({ success: true, totalProducts });
  } catch (error) {
    console.error("Error retrieving cached total products count: ", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to retrieve cached total products count...",
      });
  }
});

//Database methods

//Get item from database for update
router.get("/items/:productId/psdb", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product from database:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

//Update product in database
router.put("/items/:id/psdb", async (req, res) => {
  logger.info("!!!! /items/:id/psdb endpoint accessed");
  const productId = req.params.id;
  const updatedData = req.body;

  try {
    const [updatedRowCount] = await Product.update(updatedData, {
      where: { id: productId },
    });

    if (updatedRowCount === 0) {
      return res
        .status(404)
        .json({ error: "Product not found in database..." });
    }
    res
      .status(200)
      .json({ message: "Product updated successfully in database" });
  } catch (error) {
    console.error("Error updating product in database: ", error);
    res.status(500).json({ error: "Failed to update product in database..." });
  }
});

//add new product to the database
router.post("/items/psdb", async (req, res) => {
  const newProductData = req.body;

  try {
    const newProduct = await Product.create(newProductData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product to database: ", error);
    res.status(500).json({ error: "Failed to add new product to database..." });
  }
});

module.exports = router;

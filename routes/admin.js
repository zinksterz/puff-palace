const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const { getCachedTotalProducts } = require("../utils/cacheHandler");
const {
  updateItemInDatabase,
  deleteItemFromDatabase,
  addItemToDatabase,
  addItemToCategory,
  getItemCategories,
  syncCloverWithDatabase,
} = require("../clover_api");
const { Product } = require("../models");
const {Op} = require("sequelize");
require("dotenv").config();



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

//Route to fix items with missing category Id's
router.post("/fix-missing-categories", async(req,res) => {
  try {
    // Fetch all items with missing or null category_id
    const items = await Product.findAll({
      where: { category_id: { [Op.or]: [null, ""] } }, // Adjust based on your DB structure
    });

    if (!items.length) {
      return res.json({ message: "No items with missing categories found." });
    }

    const updates = [];
    for (const item of items) {
      try {
        // Fetch the categories for the current item via Clover API
        const categories = await getItemCategories(item.id);
        if (categories && categories.length > 0) {
          const firstCategory = categories[0]; // Assume the first category is primary

          // Update the product with the fetched category ID and name
          updates.push(
            Product.update(
              { category_id: firstCategory.id, category: firstCategory.name },
              { where: { id: item.id } }
            )
          );

          logger.info(
            `Updated item ${item.id} with category ID ${firstCategory.id} (${firstCategory.name})`
          );
        } else {
          logger.warn(`No categories found for item ${item.id}`);
        }
      } catch (error) {
        logger.error(`Failed to fetch categories for item ${item.id}:`, error);
      }
    }

    // Perform all updates in parallel
    await Promise.all(updates);
    res.json({ message: "Missing categories updated successfully." });
  } catch (error) {
    logger.error("Error fixing missing categories:", error);
    res.status(500).json({ error: "Failed to update missing categories." });
  }
});

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

//get discounted items from database
router.get("/items/discounted", async (req,res) =>{
  try{
    const discountedItems = await Product.findAll({
      where:{
        price_discounted: {[Op.not]:null},
        discount_valid_until: {[Op.gt]: new Date()},
      },
    });
    console.log("Discounted items from database: ", discountedItems);
    res.json(discountedItems);
  }catch(error){
    console.error("Error fetching discounted items from database: ", error);
    res.status(500).json({error: "Failed to fetch discounted items from database."});
  }
});

//Get single discounted item details
router.get("/items/discounted/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      attributes: [
        "id",
        "name",
        "price",
        "discount_percentage",
        "discount_valid_until",
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Discounted product not found." });
    }

    res.json({
      id: product.id,
      name: product.name,
      discount_percentage: product.discount_percentage,
      discount_valid_until: product.discount_valid_until,
    });
  } catch (error) {
    console.error("Error fetching discount details: ", error);
    res.status(500).json({ error: "Failed to fetch discount details." });
  }
});

//Update an items discount status
router.post("/update-discount", async (req,res) => {
  const {itemId, discountPercentage, validUntil} = req.body;
  console.log("Received discount payload:", req.body);
  if(!itemId) {
    return res.status(400).json({error: "Item ID is required."})
  }
  //validate req body properties
  if(
    typeof discountPercentage !== "number" && discountPercentage !== null
  ) {
    return res.status(400).json({error: "Invalid Discount Percentage."});
  }
  if (
    discountPercentage !== null &&
    (discountPercentage < 0 || discountPercentage > 100)
  ) {
    return res
      .status(400)
      .json({ error: "Discount percentage must be between 0 and 100." });
  }

  if (discountPercentage !== null && !validUntil) {
    return res.status(400).json({ error: "Valid until date is required." });
  }

  try{
    const product = await Product.findByPk(itemId);
    if(!product){
      return res.status(404).json({error:"Product not found."});
    }

    const discountedPrice = discountPercentage ? Math.round(product.price - (product.price * discountPercentage) / 100) : null;
    console.log("Discounted price: ", discountedPrice);
    await Product.update(
      {
        price_discounted: discountedPrice,
        discount_percentage: discountPercentage,
        discount_valid_until: validUntil,
      },
      {where:{id:itemId}}
    );
    
    res.json({message: "Discount applied successfully!"});
  } catch(error){
    console.error("Error applying discount: ", error);
    res.status(500).json({error: "Failed to apply discount."});
  }
});

//Discount an entire category
router.post("/update-category-discount", async(req,res) =>{
  const {categoryId, discountPercentage, validUntil } = req.body;
  try{
    const products = await Product.findAll({where:{category_id: categoryId}});
    if(!products.length) return res.status(404).json({error: "No products found in category."});

    const updates = products.map((product) => {
      const discountedPrice = Math.round(product.price - (product.price * discountPercentage) / 100);
      return Product.update(
        {
          price_discounted: discountedPrice,
          discount_percentage: discountPercentage,
          discount_valid_until: validUntil,
        },
        {where:{id: product.id}}
      );
    });
    await Promise.all(updates);
    res.json({message:"Category discount applied successfully!"});
  } catch(error){
    console.error("Error applying category discount: ", error);
    res.status(500).json({error: "Failed to apply category discount."});
  }
});

router.post("/sync-products", async (req,res) => {
  try{
    await syncCloverWithDatabase();
    res.status(200).json({message: "Products synchronized successfully!"});
  }catch(error){
    console.error("Error syncing products: ",error);
    res.status(500).json({error: "Failed to sync products..."});
  }
});

module.exports = router;

require("dotenv").config();
const logger = require("./utils/logger");
const axios = require("axios");

async function getMerchantData() {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      "Error Details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getAllCategories() {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/categories`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const categories = response.data.elements;
    const categoriesMap = {};

    categories.forEach((category) =>{
      categoriesMap[category.id] = category.name;
    });
    logger.info("Categories fetched and mapped.");
    return {categories, categoriesMap};
  } catch(error){
    logger.error(`Error fetching categories: `, error.response ? error.response.data : error.message);
    throw error;
  }
}

async function getItemCategories(itemId) {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items/${itemId}/categories`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        },
      }
    );
    return response.data.elements;
  } catch (error) {
    logger.error("Error fetching item categories: ", error);
    throw error;
  }
}

async function getItems() {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        },
      }
    );
    const items = response.data.elements;
    
    //fetch and attach categories for each item once to reduce redundant api calls
    const {categoriesMap} = await getAllCategories();
    
    //map category names to items
    items.forEach((item) => {
      item.categoryName = categoriesMap[item.categoryId] || "Uncategorized";
    });

    logger.info("Items fetched and categories mapped.");
    return items;
  } catch(error){
    logger.error("Error fetching all items: ", error.message);
    throw error;
  }
}

async function getItemsByCategory(categoryId) {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/categories/${categoryId}/items`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        },
      }
    );
    const items = response.data.elements.map((item) => ({
      ...item,
      isDiscounted: false, //defaulted to no discount >>> Updated in admin panel
    }));
    return items;
  } catch (error) {
    logger.error("Error fetching category items:", error);
    throw error;
  }
}

async function fetchProductDetails(productId) {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        },
      }
    );

    const product = response.data;
    logger.info("Product details fetched successfully: ", product);
    return product;
  } catch (error) {
    logger.error("Error fetching product details in clover_api.js: ", error);
    throw error;
  }
}

module.exports = {
  getMerchantData,
  getAllCategories,
  getItemsByCategory,
  fetchProductDetails,
  getItems,
};

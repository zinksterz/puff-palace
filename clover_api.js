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
    logger.info("Categories fetched.");
    return categories;
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
    logger.info(`Categories returned for item: ${itemId}`);
    return response.data.elements;
  } catch (error) {
    logger.error("Error fetching item categories: ", error);
    throw error;
  }
}

//Maps categories to items : no longer necessary for current workflow but may be utilized down the line
async function mapCategoriesToItems(items){
  const categories = await getAllCategories();
  const categoriesMap = {};

  categories.forEach((category) => {
    categoriesMap[category.id] = category.name;
  });

  for (let item of items) {
      try{
        const itemCategories = await getItemCategories(item.id);
        const primaryCategory = itemCategories.length > 0 ? itemCategories[0] : null;
        item.categoryId = primaryCategory ? primaryCategory.id : null;
        item.categoryName = primaryCategory ? categoriesMap[item.categoryId] : "Uncategorized";
      } catch(categoryError){
        logger.warn(`No category found for item: ${item.name}`);
        item.categoryId = null;
        item.categoryName = "Uncategorized";
      }
      return items;
  }
}

//Retrieves all items from merchant
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
    logger.info(`Items fetched successfully.`);
    return items;
  }catch(error){
    logger.error("Failed to fetch items: ", error.message);
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

async function updateItemInDatabase(itemId, updatedData) {
  try{
    const response = await axios.put(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items/${itemId}`,
    updatedData,
    {
      headers:{
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  logger.info(`Item ${itemId} updated successfully!`);
  return response.data;
  } catch(error){
    logger.error(`Error updating item ${itemId}: `, error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getMerchantData,
  getAllCategories,
  getItemsByCategory,
  fetchProductDetails,
  getItems,
  updateItemInDatabase,
};

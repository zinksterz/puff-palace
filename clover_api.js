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

async function deleteItemFromDatabase(itemId){
  try{
    const response = await axios.delete(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items/${itemId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  logger.info(`Item ${itemId} deleted successfully.`);
  return response.data;
  }catch(error){
    logger.error(`Error deleting item: ${itemId}`, error.response?.data || error.message);
    throw error;
  }
}

async function addItemToDatabase(itemData){
  try{
    const response = await axios.post(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items`,
      itemData,
      {
      headers:{
        Authorization:`Bearer ${process.env.CLOVER_API_TOKEN}`,
        "Content-Type":"application/json",
      },
    }
  );
    console.log(`Item ${itemData.name} added successfully!`);
    return response.data;
  }catch(error){
    console.error("Error adding item to Clover: ", error.response?.data || error.message);
    throw error;
  }
}

async function addItemToCategory(itemId, categoryId) {
  try {
    const response = await axios.post(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/category_items`,
      {
        elements: [
          {
            category:{id:categoryId},
            item:{id: itemId},
          },
        ],
      }, // Required payload
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      `Item ${itemId} successfully assigned to category ${categoryId} successfully!`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error assigning item ${itemId} to category ${categoryId}: `,
      error.response?.data || error.message
    );
    throw error;
  }
}

async function getTotalProductsCount() {
  let totalCount = 0;
  let offset = 0;
  const limit = 100;//Clovers default page size
  const url = `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items`;
  try{
    while(true){
      const response = await axios.get(url,{
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        },
        params: {
          limit,
          offset,//fetches the next page
        },
      });
      const items = response.data.elements;
      totalCount += items.length;

      //Break out if fewer than limit
      if(items.length < limit){
        break;
      }
      offset += limit;//move to next page
    }
    return totalCount;
  }catch(error){
    console.error("Error fetching total products count: ", error);
    throw error;
  }
}

//Methods handling db integration 
async function fetchAllItems() {
  const baseUrl = `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items`;
  const items = [];
  let offset = 0;
  const limit = 100;
  let hasNextPage = true;

  try{
    while(hasNextPage){
      const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      //add items to array
      items.push(...response.data.elements);
      //Check for next page
      if(response.data.elements.length < limit){
        hasNextPage = false;
      } else{
        offset += limit;
      }
    }
    console.log("Items length: ", items.length);
    return items;
  }catch(error){
    console.error("Error fetching items from Clover API: ", error.message);
    throw error;
  }
}



module.exports = {
  getMerchantData,
  getAllCategories,
  getItemsByCategory,
  getItemCategories,
  fetchProductDetails,
  getItems,
  updateItemInDatabase,
  deleteItemFromDatabase,
  addItemToDatabase,
  addItemToCategory,
  getTotalProductsCount,
  fetchAllItems,
};

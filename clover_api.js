require("dotenv").config();
const logger = require("./utils/logger");
const axios = require("axios");

async function getMerchantData() {

  try {
    const response = await axios.get(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
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

  try{
    const response = await axios.get(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/categories`,{
      headers: {
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error){
    logger.error(`Error Details: `, error.response ? error.response.data : error.message);
    throw error;
  }
}

async function getItemsByCategory(categoryId){
  try{
    const response = await axios.get(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/categories/${categoryId}/items`,{
      headers:{
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
      }
    });
    const items = response.data.elements.map((item) =>({
      ...item,
      isDiscounted: false, //defaulted to no discount >>> Updated in admin panel
    }));
    return items;
    
  } catch(error){
    logger.error("Error fetching category items:", error);
    throw error;
  }
}

async function fetchProductDetails(productId){
  try{
    const response = await axios.get(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items/${productId}`, {
      headers:{
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
      },
    });
    
    const product = response.data;
    logger.info("Product details fetched successfully: ", product);
    return product;
  }
  catch(error){
    logger.error("Error fetching product details in clover_api.js: ", error);
    throw error;
  }
}


module.exports = { getMerchantData, getAllCategories, getItemsByCategory, fetchProductDetails };
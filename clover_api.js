require("dotenv").config();
const axios = require("axios");

async function getMerchantData() {

  try {
    const response = await axios.get(`${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/categories`, {
      headers: {
        Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error Details:",
      error.response ? error.response.data : error.message
    );
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
    return response.data.elements;
  } catch(error){
    console.error("Error fetching category items:", error);
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
    console.log("Product details fetched successfully: ", product);
    return product;
  }
  catch(error){
    console.error("Error fetching product details in clover_api.js: ", error);
    throw error;
  }
}


module.exports = { getMerchantData, getItemsByCategory, fetchProductDetails };
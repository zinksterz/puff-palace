require("dotenv").config();
const logger = require("./utils/logger");
const axios = require("axios");
const {Product} = require("./models");

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
    const items = response.data.elements;
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
    console.log("Here is the payload being sent from api call:", itemData);
  const payload={
    name: itemData.name,
    price: itemData.price,
    available: itemData.available,
    categories: [{id: itemData.category_id, name:itemData.category}],
  };
  try{
    const response = await axios.post(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/items`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Item ${itemData.name} added successfully to Clover!`);
    // console.log("Here is the payload being sent from api call:", response.data);
    await Product.create({
      id: response.data.id,
      name: itemData.name,
      price: itemData.price,
      description: itemData.description || "No description was provided.",
      category: itemData.category,
      category_id: itemData.category_id,
      image_url: itemData.image_url || "",
      tags: itemData.tags || [],
      is_featured: itemData.is_featured || false,
    });

    console.log(
      `Item ${itemData.name} added successfully to the local database!`
    );
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
    console.log("Fetched total products count:", totalCount);
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

//Merchant revenue calculator
async function getMerchantRevenue() {
  try {
    const response = await axios.get(
      `${process.env.SANDBOX_URL}/merchants/${process.env.MID_PUFF_PALACE}/payments`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
        },
      }
    );

    const payments = response.data.elements;
    let totalRevenue = 0;

    // Calculate the total revenue
    payments.forEach((payment) => {
      totalRevenue += payment.amount;
    });

    // Convert revenue to dollars (assuming amounts are in cents)
    totalRevenue = totalRevenue / 100;

    return totalRevenue;
  } catch (error) {
    logger.error("Error fetching revenue from Clover API:", error.message);
    throw error;
  }
}

//Syncing database and clover 
async function syncCloverWithDatabase() {
  try {
    //fetch products from Clover
    const cloverProducts = await getItems();
    const cloverProductIds = cloverProducts.map((product) => product.id);

    //Fetch all products from database
    const localProducts = await Product.findAll();
    const localProductIds = localProducts.map((product) => product.id);

    //Identify products to delete from database if they have been removed from Clover
    const productsToDelete = localProducts.filter(
      (product) => !cloverProductIds.includes(product.id)
    );

    // Delete products that are no longer in Clover
    for (const product of productsToDelete) {
      await Product.destroy({ where: { id: product.id } });
      logger.info(
        `Deleted product ${product.name} (${product.id}) from the database.`
      );
    }

    // Upsert remaining products into the database
    for (const cloverProduct of cloverProducts) {
      const categories = await getItemCategories(cloverProduct.id);

      const category = categories.length > 0 ? categories[0].name : "Uncategorized";
      const categoryId = categories.length > 0 ? categories[0].id : null;

      await Product.upsert({
        id: cloverProduct.id,
        name: cloverProduct.name,
        price: cloverProduct.price,
        category,
        category_id: categoryId,
        image_url: cloverProduct.imageUrl || "",
        tags: cloverProduct.tags || [],
        is_featured: cloverProduct.isFeatured || false,
      });
    }

    logger.info("Sync with Clover completed successfully.");
  } catch (error) {
    logger.error("Error syncing with Clover: ", error);
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
  syncCloverWithDatabase,
  getMerchantRevenue,
};

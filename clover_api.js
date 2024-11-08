require("dotenv").config();
const axios = require("axios");

async function getMerchantData() {
  const merchantId = process.env.MID_PUFF_PALACE;
  const token = process.env.CLOVER_API_TOKEN;
  const sandboxUrl = process.env.SANDBOX_URL;

  try {
    const response = await axios.get(`${sandboxUrl}/merchants/${merchantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

module.exports = { getMerchantData };

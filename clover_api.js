require("dotenv").config();
const axios = require("axios");
// const appSecret = process.env.APP_SECRET;
// const appID = process.env.APP_ID;
// const cloverApiToken = process.env.CLOVER_API_TOKEN;
// const ePubToken = process.env.ECOM_PUB_TOKEN;
// const ePrivToken = process.env.ECOM_PRIV_TOKEN;
// const merhantOwner = process.env.MID_MERCHANT;
// const merchantStore = process.env.MID_PUFF_PALACE;
// const sandboxUrl = process.env.SANDBOX_URL;

// const config = {
//   headers: {
//     Authorization: `Bearer ${cloverApiToken}`,
//   },
// };

// // axios.get();

// const options = {
//   method: "GET",
//   headers: {
//     accept: "application/json",
//     authorization: "Bearer " + cloverApiToken,
//   },
// };

// fetch("https://sandbox.dev.clover.com/v3/merchants/mId", options)
//   .then((response) => response.json())
//   .then((response) => console.log(response))
//   .catch((err) => console.error(err));

//fetch merchant data

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
    console.error("Failed to fetch merchant data in clover_api.js:", error);
    throw error;
  }
}

module.exports = { getMerchantData };

require("dotenv").config();

const appSecret = process.env.APP_SECRET;
const appID = process.env.APP_ID;
const cloverApiToken = process.env.CLOVER_API_TOKEN;
const ePubToken = process.env.ECOM_PUB_TOKEN;
const ePrivToken = process.env.ECOM_PRIV_TOKEN;
const merhantOwner = process.env.MID_MERCHANT;
const merchantStore = process.env.MID_PUFF_PALACE;
const sandboxUrl = process.env.SANDBOX_URL;

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

async function getMerchant() {
  const merchantId = merchantStore;
  const token = cloverApiToken;

  try {
    const response = await fetch(sandboxUrl + "/merchants" + "/" + merchantId, {
      method: "GET",
      headers: {
        Authorization: "Bearer ${token}",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error: ${response.status} - ${response.statusText");
    }

    const data = await response.json();
    console.log("Merchant Data:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch merchant data:", error);
  }
}
//node js is not going to work like this because document is only available in browser environment -- could set a button to call function or place function in html and would work
document.addEventListener("DOMContentLoaded", () => {
  getMerchant();
});

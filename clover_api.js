require("dotenv").config();

const appSecret = process.env.APP_SECRET;
const appID = process.env.APP_ID;
const cloverApiToken = process.env.CLOVER_API_TOKEN;
const ePubToken = process.env.ECOM_PUB_TOKEN;
const ePrivToken = process.env.ECOM_PRIV_TOKEN;
const merhantOwner = process.env.MID_MERCHANT;
const merchantStore = process.env.MID_PUFF_PALACE;
const sandboxUrl = process.env.SANDBOX_URL;

const config = {
  headers: {
    Authorization: `Bearer ${cloverApiToken}`,
  },
};

// axios.get();

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    authorization: "Bearer 2f0bf1a7-8ef0-d715-76ac-555c98e8cce3",
  },
};

fetch("https://sandbox.dev.clover.com/v3/merchants/mId", options)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));

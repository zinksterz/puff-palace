//Information for Puff Palace test Merchant
const appSecret = "a13ba782-5191-f192-ff02-15ddebca7a60";
const appId = "9KEFGPWYMY6EJ";
//apiToken from test merchants Puff Me settings 
const apiToken = "2f0bf1a7-8ef0-d715-76ac-555c98e8cce3";
//Ecommerce Tokens - set to require captcha
const publicToken = "42eadf26c5f234924ad70528bda7a051";
const privateToken = "10ea8b76-bcd9-2094-f619-5285eaafcde2";
//MID for Merchant Account
const MID = "RCTSTAVI0010002";
//mIdPuffPalace is unique to the store location
const mIdPuffPalace = "P5F27RSSX18F1";
//It could or could not be this one...
const sandboxBaseUrl = "https://apisandbox.dev.clover.com";
//ex req: https://apisandbox.dev.clover.com/v3/merchants/{mId}

const config = {
  headers: {
    Authorization: `Bearer ${apiToken}`,
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
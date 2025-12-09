// backend/src/test-message.js
require("dotenv").config();
const axios = require("axios");

async function sendTestMessage() {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  // ⚠️ REPLACE THIS with your personal WhatsApp number (e.g., "919999999999")
  // Must be the same number you just whitelisted!
  const myNumber = "917331176808";

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: myNumber,
    type: "template",
    template: {
      name: "hello_world",
      language: { code: "en_US" },
    },
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    console.log(`Sending message to ${myNumber}...`);
    const response = await axios.post(url, data, { headers });
    console.log("✅ Success! Message sent.");
    console.log("Response ID:", response.data.messages[0].id);
  } catch (error) {
    console.error("❌ Error sending message:");
    console.error(error.response ? error.response.data : error.message);
  }
}

sendTestMessage();

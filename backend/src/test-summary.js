// backend/src/test-summary.js
const path = require("path");

// ✅ FIX: Added the dot before "env"
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { generateAndSendSummary } = require("./dailySummary");

(async () => {
  console.log("🧪 Starting Manual Test...");

  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  console.log(
    `Debug: Looking for .env at: ${path.join(__dirname, "..", ".env")}`
  );
  console.log(
    `Debug: PHONE_NUMBER_ID is: ${phoneId ? "LOADED ✅" : "UNDEFINED ❌"}`
  );

  if (!phoneId) {
    console.error("❌ STOPPING: Still can't find .env variables.");
    process.exit(1);
  }

  try {
    await generateAndSendSummary();
    console.log("✅ Test Complete! Check your WhatsApp.");
  } catch (e) {
    console.error("❌ Test Failed:", e.message);
    if (e.response) {
      console.error("API Error Data:", e.response.data);
    }
  }
  process.exit();
})();

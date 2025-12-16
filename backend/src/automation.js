const cron = require("node-cron");
const axios = require("axios");
const db = require("./db");
require("dotenv").config();

// --- CONFIGURATION ---
const ABANDONED_THRESHOLD_MINUTES = 15;
const MAX_RETRIES = 3;

// FIX: Use the exact names from your .env file
const WHATSAPP_TOKEN = process.env.WA_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;

const startAbandonedCartWorker = () => {
  console.log("🟢 [Worker] Abandoned Cart Automation Started...");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      console.log("🔍 Checking for abandoned carts...");

      // FIX: Added o.customer_id to SELECT list
      const query = `
                SELECT o.id, o.customer_id, o.amount, o.items, c.phone, c.name 
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                WHERE o.status = 'pending'
                AND o.created_at < NOW() - INTERVAL '${ABANDONED_THRESHOLD_MINUTES} minutes'
                
                AND NOT EXISTS (
                    SELECT 1 FROM automation_events ae 
                    WHERE ae.customer_id = c.id 
                    AND ae.event_type = 'abandoned_reminded'
                    AND ae.metadata->>'order_id' = o.id::text
                )
                AND NOT EXISTS (
                    SELECT 1 FROM messages m
                    WHERE m.customer_id = c.id
                    AND m.direction = 'in'
                    AND m.created_at > o.created_at
                )
            `;

      const result = await db.query(query);

      if (result.rows.length === 0) return;

      console.log(`⚡ Found ${result.rows.length} carts to recover.`);

      for (const order of result.rows) {
        await processOrder(order);
      }
    } catch (error) {
      console.error("🔴 Global Worker Error:", error.message);
    }
  });
};

async function processOrder(order) {
  const firstItem =
    order.items && order.items.length > 0
      ? order.items[0].name
      : "your cart items";

  // Template params must be strings
  const templateParams = [
    { type: "text", text: order.name || "Customer" },
    { type: "text", text: firstItem },
  ];

  const success = await sendWithRetry(order.phone, templateParams);

  if (success) {
    await logEvent(order, "abandoned_reminded", { status: "success" });
    console.log(`✅ Recovered message sent to ${order.phone}`);
  } else {
    await logEvent(order, "abandoned_failed", { status: "failed" });
    console.error(`❌ Failed to send to ${order.phone}`);
  }
}

async function sendWithRetry(phone, parameters, attempt = 1) {
  try {
    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "abandoned_cart", // ⚠️ MAKE SURE THIS EXISTS IN META
        language: { code: "en" },
        components: [{ type: "body", parameters: parameters }],
      },
    };

    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
    return true;
  } catch (error) {
    console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
    if (attempt < MAX_RETRIES) {
      await new Promise((res) => setTimeout(res, 1000));
      return sendWithRetry(phone, parameters, attempt + 1);
    } else {
      return false;
    }
  }
}

async function logEvent(order, type, metadata) {
  try {
    await db.query(
      `
            INSERT INTO automation_events (customer_id, event_type, metadata)
            VALUES ($1, $2, $3)
        `,
      [
        order.customer_id,
        type,
        JSON.stringify({ order_id: order.id, ...metadata }),
      ]
    );
  } catch (e) {
    console.error("Failed to log event:", e.message);
  }
}

module.exports = { startAbandonedCartWorker };

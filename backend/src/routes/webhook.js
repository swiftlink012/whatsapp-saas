const express = require("express");
const router = express.Router();
const db = require("../db");
const axios = require("axios");
const stringSimilarity = require("string-similarity");
require("dotenv").config();

// --- HELPER 1: Send WhatsApp Message ---
async function sendMessage(to, text) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (err) {
    console.error("❌ Error sending Meta reply:", err.message);
    return false;
  }
}

// --- HELPER 2: Save Message to History ---
async function saveMessage(customerId, text, direction) {
  try {
    await db.query(
      "INSERT INTO messages (customer_id, text, direction) VALUES ($1, $2, $3)",
      [customerId, text, direction]
    );
  } catch (e) {
    console.error("Failed to save message history:", e.message);
  }
}

// --- HELPER 3: Extract Quantity (THE FIX) ---
function extractQuantity(text) {
  // Looks for the first digit in the string (e.g. "2" in "I want 2 burgers")
  const match = text.match(/(\d+)/);
  if (match) {
    const qty = parseInt(match[0], 10);
    return qty > 0 ? qty : 1;
  }
  return 1; // Default to 1 if no number found
}

// --- HELPER 4: Format Menu for Text ---
const formatMenuMessage = (menuArray) => {
  if (!menuArray || menuArray.length === 0)
    return "⚠️ Our menu is currently empty.";

  let message = "🍽️ *TODAY'S MENU* 🍽️\n\n";
  const categories = {};

  menuArray.forEach((item) => {
    const cat = item.category || "Others";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  for (const [category, items] of Object.entries(categories)) {
    message += `*─── ${category.toUpperCase()} ───*\n`;
    items.forEach((item) => {
      message += `▪️ *${item.itemName}* _₹${item.price}_\n`;
    });
    message += "\n";
  }
  message +=
    "👇 *Reply with an item name and quantity (e.g., '2 Burgers') to order!*";
  return message;
};

// --- HELPER 5: Fuzzy Match Product ---
function findProductInMessage(userMessage, menuItems) {
  if (!menuItems || menuItems.length === 0) return null;
  const productNames = menuItems.map((p) => p.itemName);

  // Clean message: remove numbers so "2 pizza" becomes "pizza" for matching
  const cleanMsg = userMessage
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/[^\w\s]/gi, "");
  const userWords = cleanMsg.split(" ");

  let bestMatchProduct = null;
  let highestScore = 0;

  userWords.forEach((word) => {
    if (word.length < 3) return;

    const match = stringSimilarity.findBestMatch(word, productNames);
    const best = match.bestMatch;

    if (best.rating > 0.5 && best.rating > highestScore) {
      highestScore = best.rating;
      bestMatchProduct = menuItems.find((p) => p.itemName === best.target);
    }
  });

  return bestMatchProduct;
}

// --- ROUTE: Incoming Messages ---
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    res.sendStatus(200);

    if (body.object) {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const ch of changes) {
          const value = ch.value || {};
          const messages = value.messages || [];
          const contacts = value.contacts || [];

          if (messages.length > 0) {
            const m = messages[0];
            const phone = m.from;
            const text = m.text && m.text.body ? m.text.body : "";
            const name = contacts[0] ? contacts[0].profile.name : "Unknown";

            console.log(`📩 Message from ${name}: "${text}"`);

            // 1. GET / CREATE CUSTOMER
            let customerId;
            const custRes = await db.query(
              "SELECT id FROM customers WHERE phone = $1",
              [phone]
            );
            if (custRes.rows.length === 0) {
              const newCust = await db.query(
                "INSERT INTO customers (phone, name) VALUES ($1, $2) RETURNING id",
                [phone, name]
              );
              customerId = newCust.rows[0].id;
            } else {
              customerId = custRes.rows[0].id;
            }

            await saveMessage(customerId, text, "in");

            // 2. FETCH MENU (Admin ID 1)
            const userRes = await db.query(
              "SELECT menu FROM users WHERE id = 1"
            );
            const menu = userRes.rows[0]?.menu || [];

            // 3. LOGIC CONTROLLER
            const lowerText = text.toLowerCase().trim();
            let botReply = "";

            if (
              lowerText === "menu" ||
              lowerText === "hi" ||
              lowerText === "hello"
            ) {
              botReply = formatMenuMessage(menu);
              await sendMessage(phone, botReply);
            } else {
              const matchedProduct = findProductInMessage(text, menu);

              if (matchedProduct) {
                // ✅ FIX: Use Helper to get Quantity
                const qty = extractQuantity(text);

                // Calculate Total Price
                const totalPrice = (
                  parseFloat(matchedProduct.price) * qty
                ).toFixed(2);

                console.log(
                  `✅ Order Detected: ${qty}x ${matchedProduct.itemName}`
                );

                const itemsJson = JSON.stringify([
                  {
                    name: matchedProduct.itemName,
                    price: matchedProduct.price,
                    qty: qty, // <--- SAVING CORRECT QUANTITY
                  },
                ]);

                const orderRes = await db.query(
                  `INSERT INTO orders (customer_name, phone, amount, status, items, customer_id, created_at)
                   VALUES ($1, $2, $3, 'pending', $4, $5, NOW()) RETURNING id`,
                  [name, phone, totalPrice, itemsJson, customerId]
                );

                botReply = `✅ *Order Received!*\n\n${qty}x ${matchedProduct.itemName} - ₹${totalPrice}\n\nOrder #${orderRes.rows[0].id} is pending confirmation.`;
                await sendMessage(phone, botReply);
              } else {
                botReply = `👋 Hi ${name}! I didn't understand that.\n\nType *Menu* to see what we have available!`;
                await sendMessage(phone, botReply);
              }
            }

            if (botReply) {
              await saveMessage(customerId, botReply, "out");
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Webhook Error:", err);
  }
});

// Verification Route
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;

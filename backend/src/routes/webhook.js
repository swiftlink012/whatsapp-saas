// backend/src/routes/webhook.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const axios = require("axios");
require("dotenv").config();

// Helper function to send messages via Meta API
async function sendMessage(to, text) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: text },
  };

  try {
    await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`✅ Replied to ${to}`);
  } catch (err) {
    console.error(
      "❌ Error sending reply:",
      err.response ? err.response.data : err.message
    );
  }
}

// 1. Verification Route (GET)
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Incoming Messages Route (POST)
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Check if this is a WhatsApp status update
    if (body.object) {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const ch of changes) {
          const value = ch.value || {};
          const messages = value.messages || [];

          for (const m of messages) {
            const phone = m.from;
            const text = m.text && m.text.body ? m.text.body : null;
            const whatsappId = m.id;

            // 1. Save to Database
            if (text) {
              // Upsert Customer
              const upsertCust = `
                INSERT INTO customers (phone) VALUES ($1)
                ON CONFLICT (phone) DO UPDATE SET last_contacted = now()
                RETURNING id;
              `;
              const custRes = await db.query(upsertCust, [phone]);
              const customerId = custRes.rows[0].id;

              // Insert Message
              await db.query(
                "INSERT INTO messages (customer_id, direction, whatsapp_id, text) VALUES ($1,$2,$3,$4)",
                [customerId, "in", whatsappId, text]
              );

              console.log(`📩 Received from ${phone}: ${text}`);

              // 2. AUTO-REPLY LOGIC
              // Example: If they say "hi", we reply "Welcome!"
              const replyText = `Thanks for messaging! We saved: "${text}"`;
              await sendMessage(phone, replyText);

              // Save the REPLY to database too (so it shows in chat history later)
              await db.query(
                "INSERT INTO messages (customer_id, direction, text) VALUES ($1,$2,$3)",
                [customerId, "out", replyText]
              );
            }
          }
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;

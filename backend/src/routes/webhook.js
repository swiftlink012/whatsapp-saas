// backend/src/routes/webhook.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// 1. GET Route: Verification for Meta
// When you set up the webhook in the Meta dashboard, they hit this URL to verify it.
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. POST Route: Incoming Messages
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // "entry" is the top-level array in Meta's webhook format
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const ch of changes) {
        const value = ch.value || {};
        const messages = value.messages || [];

        for (const m of messages) {
          // Extract data
          const phone = m.from; // e.g., "919900..."
          const text = m.text && m.text.body ? m.text.body : null;
          const whatsappId = m.id;

          // 1. Upsert Customer (Create if new, update timestamp if exists)
          const upsertCust = `
            INSERT INTO customers (phone)
            VALUES ($1)
            ON CONFLICT (phone) DO UPDATE SET last_contacted = now()
            RETURNING id;
          `;
          const custRes = await db.query(upsertCust, [phone]);
          const customerId = custRes.rows[0].id;

          // 2. Insert the Message
          await db.query(
            "INSERT INTO messages (customer_id, direction, whatsapp_id, text) VALUES ($1,$2,$3,$4)",
            [customerId, "in", whatsappId, text]
          );

          console.log(`Saved message from ${phone}: ${text}`);
        }
      }
    }
    // Always return 200 OK to Meta, otherwise they keep retrying
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;

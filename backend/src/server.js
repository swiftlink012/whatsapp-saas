// backend/src/server.js
require("dotenv").config();
const axios = require("axios"); // <--- Fixed: Using require
const express = require("express");
const db = require("./db");
const webhookRouter = require("./routes/webhook");
const cors = require("cors");

// REMOVED the "import" line that caused the crash
// const eventRoutes = require("./routes/events.js"); // Uncomment only if you actually have this file

const app = express();
app.use(cors());
app.use(express.json());

// REMOVED the usage of eventRoutes to prevent errors
// app.use("/api/v1/events", eventRoutes);

// 1. Health Check Endpoint
app.get("/health", (req, res) => res.send({ ok: true }));

// 2. GET /customers (Fetch all customers)
app.get("/customers", async (req, res) => {
  try {
    const q = await db.query(
      "SELECT * FROM customers ORDER BY created_at DESC LIMIT 100"
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 3. POST /customers (Create or Update a customer)
app.post("/customers", async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ error: "phone required" });

  const upsert = `
    INSERT INTO customers (phone, name)
    VALUES ($1, $2)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
    RETURNING *;
  `;

  try {
    const result = await db.query(upsert, [phone, name || null]);
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.use("/webhook", webhookRouter);

// 4. GET /customers/:id/messages (Fetch chat history for one person)
app.get("/customers/:id/messages", async (req, res) => {
  const customerId = req.params.id;
  try {
    const q = await db.query(
      `SELECT * FROM messages 
       WHERE customer_id = $1 
       ORDER BY created_at ASC`,
      [customerId]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 5. POST /messages (Send a message from the Dashboard)
app.post("/messages", async (req, res) => {
  const { customerId, text } = req.body;

  try {
    // 1. Get customer phone number
    const custRes = await db.query(
      "SELECT phone FROM customers WHERE id = $1",
      [customerId]
    );
    if (custRes.rows.length === 0)
      return res.status(404).json({ error: "Customer not found" });
    const phone = custRes.rows[0].phone;

    // 2. Send to Meta
    const token = process.env.WA_ACCESS_TOKEN;
    const phoneId = process.env.WA_PHONE_NUMBER_ID;

    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 3. Save to DB
    const savedMsg = await db.query(
      "INSERT INTO messages (customer_id, direction, text) VALUES ($1, $2, $3) RETURNING *",
      [customerId, "out", text]
    );

    res.json(savedMsg.rows[0]);
  } catch (e) {
    // Better Error Logging
    console.error("Meta API Error:", e.response ? e.response.data : e.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server running on port", port));

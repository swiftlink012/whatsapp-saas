// backend/src/server.js
require("dotenv").config();
const express = require("express");
const db = require("./db");
const webhookRouter = require("./routes/webhook"); // <--- ADD THIS
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

  // This SQL inserts a new customer, or updates the name if the phone already exists
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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server running on port", port));

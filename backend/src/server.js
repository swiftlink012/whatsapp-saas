require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session");
const passport = require("passport");
const db = require("./db");

// Route Imports
const webhookRouter = require("./routes/webhook");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/events");
const dashboard = require("./dashboard");

// Automation Imports
const { startAbandonedCartWorker } = require("./automation");
const {
  startDailySummaryWorker,
  generateAndSendSummary,
} = require("./dailySummary");
const { getDailyStats } = require("./analytics");

const app = express();
const port = process.env.PORT || 4000;

// --- 1. MIDDLEWARE SETUP ---

// CORS: Allow credentials for session cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Make sure this matches your Frontend URL
    credentials: true,
  })
);

app.use(express.json());

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 Day
      secure: false, // Set to true if using HTTPS in production
    },
  })
);

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// --- 2. ROUTES ---

app.use("/api/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/webhook", webhookRouter);

// --- HELPER: Send WhatsApp Message ---
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
    console.log(`✅ Message sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending WhatsApp message:", err.message);
  }
}

// --- APP ROUTES ---

app.get("/health", (req, res) => res.send({ ok: true }));

app.get("/analytics/daily", async (req, res) => {
  const stats = await getDailyStats();
  res.json(stats);
});

// --- MENU MANAGEMENT ROUTES ---

// 1. Get current menu
app.get("/api/menu", async (req, res) => {
  // Use logged-in user ID, or default to 1 for testing
  const userId = req.user ? req.user.id : 1;

  try {
    const result = await db.query("SELECT menu FROM users WHERE id = $1", [
      userId,
    ]);
    // Return the menu array, or an empty array if null
    res.json(result.rows[0]?.menu || []);
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// 2. Update menu (Replaces the entire JSON array)
app.put("/api/menu", async (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { menu } = req.body; // Expecting an array: [{ itemName: "...", ... }]

  try {
    // Postgres handles JSONB stringification automatically for prepared statements
    await db.query("UPDATE users SET menu = $1 WHERE id = $2", [
      JSON.stringify(menu),
      userId,
    ]);

    res.json({ success: true, message: "Menu saved successfully" });
  } catch (err) {
    console.error("Error updating menu:", err);
    res.status(500).json({ error: "Failed to save menu" });
  }
});

// --- CUSTOMER ROUTES ---

app.get("/customers", async (req, res) => {
  try {
    const q = await db.query(
      "SELECT * FROM customers ORDER BY created_at DESC LIMIT 100"
    );
    res.json(q.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/customers", async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ error: "phone required" });

  const upsert = `
    INSERT INTO customers (phone, name) VALUES ($1, $2)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
    RETURNING *;
  `;
  try {
    const result = await db.query(upsert, [phone, name || null]);
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { tags, name } = req.body;
  try {
    let query = "UPDATE customers SET ";
    const values = [];
    const updates = [];
    let counter = 1;

    if (tags) {
      updates.push(`tags = $${counter}`);
      values.push(tags);
      counter++;
    }
    if (name) {
      updates.push(`name = $${counter}`);
      values.push(name);
      counter++;
    }

    if (updates.length === 0) return res.json({ message: "No changes" });

    query += updates.join(", ") + ` WHERE id = $${counter} RETURNING *`;
    values.push(id);

    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MESSAGES ROUTES ---
app.get("/customers/:id/messages", async (req, res) => {
  const customerId = req.params.id;
  try {
    const q = await db.query(
      "SELECT * FROM messages WHERE customer_id = $1 ORDER BY created_at ASC",
      [customerId]
    );
    res.json(q.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/messages", async (req, res) => {
  const { customerId, text } = req.body;
  try {
    const custRes = await db.query(
      "SELECT phone FROM customers WHERE id = $1",
      [customerId]
    );
    if (custRes.rows.length === 0)
      return res.status(404).json({ error: "Customer not found" });
    const phone = custRes.rows[0].phone;

    // Send to Meta
    await sendMessage(phone, text);

    // Save to DB
    const savedMsg = await db.query(
      "INSERT INTO messages (customer_id, direction, text) VALUES ($1, $2, $3) RETURNING *",
      [customerId, "out", text]
    );
    res.json(savedMsg.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// --- SETTINGS ROUTES ---
app.get("/api/settings", async (req, res) => {
  const userId = req.user ? req.user.id : 1;
  try {
    const result = await db.query(
      "SELECT daily_summary_enabled, notification_phone FROM users WHERE id = $1",
      [userId]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings/notifications", async (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { enabled, phone } = req.body;
  try {
    await db.query(
      "UPDATE users SET daily_summary_enabled = $1, notification_phone = $2 WHERE id = $3",
      [enabled, phone, userId]
    );
    res.json({ success: true, message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings/test-summary", async (req, res) => {
  const userId = req.user ? req.user.id : 1;
  try {
    const result = await db.query(
      "SELECT notification_phone FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];
    if (!user || !user.notification_phone)
      return res.status(400).json({ error: "No phone number saved." });

    await generateAndSendSummary(user.notification_phone);
    res.json({ success: true, message: "Test summary sent!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send summary: " + err.message });
  }
});

// --- DASHBOARD ROUTES ---
app.get("/api/dashboard/stats", dashboard.getDashboardStats);
app.get("/api/orders", dashboard.getOrders);
app.patch("/api/orders/:id/status", dashboard.updateOrderStatus);

// --- START SERVER ---
// Start Workers
startAbandonedCartWorker();
startDailySummaryWorker();

app.listen(port, () => console.log("Server running on port", port));

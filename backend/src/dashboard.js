const db = require("./db");
const axios = require("axios"); // <--- 1. Require Axios
require("dotenv").config();

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
    console.log(`✅ Status Update sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending status update:", err.message);
  }
}

// 1. GET STATS (Cards + 7 Day Trend)
const getDashboardStats = async (req, res) => {
  try {
    // Fetch raw order data for the last 7 days
    const query = `
            SELECT id, amount, status, created_at 
            FROM orders 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        `;
    const { rows } = await db.query(query);

    const stats = {
      revenue: { total: 0, trend: new Array(7).fill(0) },
      orders: { total: 0, trend: new Array(7).fill(0) },
      abandoned: { total: 0, trend: new Array(7).fill(0) },
    };

    const today = new Date();

    rows.forEach((order) => {
      const orderDate = new Date(order.created_at);
      const daysAgo = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

      const index = 6 - daysAgo;
      if (index < 0 || index > 6) return;

      if (order.status === "completed") {
        stats.revenue.total += Number(order.amount);
        stats.orders.total += 1;
        stats.revenue.trend[index] += Number(order.amount);
        stats.orders.trend[index] += 1;
      } else if (order.status === "pending" || order.status === "abandoned") {
        stats.abandoned.total += 1;
        stats.abandoned.trend[index] += 1;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// 2. GET ORDERS LIST (With Search)
const getOrders = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM orders`;
    let params = [];

    if (search) {
      query += ` WHERE customer_name ILIKE $1 OR phone ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 3. UPDATE STATUS (Fixed)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // A. First, fetch the order to get the Phone Number
    const orderRes = await db.query("SELECT phone FROM orders WHERE id = $1", [
      id,
    ]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const phone = orderRes.rows[0].phone;

    // B. Update the Database
    await db.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);

    // C. Send WhatsApp Message based on status
    if (status === "completed") {
      await sendMessage(
        phone,
        "✅ *Order Update:* Your order is ready! Please pick it up at the counter."
      );
    } else if (status === "abandoned" || status === "rejected") {
      await sendMessage(
        phone,
        "❌ *Order Update:* Sorry, we cannot fulfill your order at this time."
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getDashboardStats, getOrders, updateOrderStatus };

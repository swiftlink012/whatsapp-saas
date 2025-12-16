// backend/dashboard.js
const db = require("./src/db");

// Helper to get array of last 7 dates (YYYY-MM-DD)
function getLast7Days() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// 1. GET DASHBOARD STATS (Cards)
exports.getDashboardStats = async (req, res) => {
  try {
    // A. Get Totals (Lifetime)
    const totalRes = await db.query(`
      SELECT 
        status, 
        COUNT(*) as count, 
        SUM(amount) as revenue 
      FROM orders 
      GROUP BY status
    `);

    // B. Get Trend Data (Last 7 Days)
    // We group by "created_at" date and "status"
    const trendRes = await db.query(`
      SELECT 
        to_char(created_at, 'YYYY-MM-DD') as day,
        status,
        COUNT(*) as count,
        SUM(amount) as daily_revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day, status
      ORDER BY day ASC
    `);

    // --- PROCESS DATA ---
    const last7Days = getLast7Days();

    // Initialize empty trend arrays for each day
    const trends = {
      revenue: last7Days.map(() => 0),
      orders: last7Days.map(() => 0), // Completed orders
      abandoned: last7Days.map(() => 0),
    };

    // Fill trends from DB results
    trendRes.rows.forEach((row) => {
      const dayIndex = last7Days.indexOf(row.day);
      if (dayIndex !== -1) {
        if (row.status === "completed") {
          trends.orders[dayIndex] += parseInt(row.count);
          trends.revenue[dayIndex] += parseFloat(row.daily_revenue);
        } else if (row.status === "pending" || row.status === "abandoned") {
          trends.abandoned[dayIndex] += parseInt(row.count);
        }
      }
    });

    // Calculate Totals safely
    let totalRev = 0;
    let totalOrders = 0;
    let totalAbandoned = 0;

    totalRes.rows.forEach((row) => {
      if (row.status === "completed") {
        totalRev += parseFloat(row.revenue || 0);
        totalOrders += parseInt(row.count || 0);
      } else if (row.status === "pending" || row.status === "abandoned") {
        totalAbandoned += parseInt(row.count || 0);
      }
    });

    // Send formatted response
    res.json({
      revenue: { total: totalRev, trend: trends.revenue },
      orders: { total: totalOrders, trend: trends.orders },
      abandoned: { total: totalAbandoned, trend: trends.abandoned },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stats failed" });
  }
};

// 2. GET RECENT ORDERS (List with Search)
exports.getOrders = async (req, res) => {
  const { search } = req.query;
  try {
    let query = `
      SELECT o.id, o.amount, o.status, o.created_at, c.name as customer_name, c.phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
    `;

    const params = [];
    if (search) {
      query += ` WHERE c.name ILIKE $1 OR c.phone ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC LIMIT 50`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Orders failed" });
  }
};

// 3. UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'completed' or 'abandoned'

  try {
    await db.query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
      [status, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

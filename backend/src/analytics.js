const db = require("./db");

async function getDailyStats() {
  try {
    // 1. Define "Start of Today" (00:00:00)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 2. Run Aggregation Query
    const query = `
      SELECT 
        -- Total Orders Created Today
        COUNT(*) FILTER (WHERE created_at >= $1) as new_orders,
        
        -- Revenue (Only 'completed' orders)
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND created_at >= $1), 0) as total_revenue,
        
        -- Abandoned Count (Pending/Abandoned)
        COUNT(*) FILTER (WHERE status IN ('abandoned', 'pending') AND created_at >= $1) as abandoned_count,
        
        -- Lost Revenue Estimate
        COALESCE(SUM(amount) FILTER (WHERE status IN ('abandoned', 'pending') AND created_at >= $1), 0) as lost_revenue_estimate,
        
        -- Recovered Count (Orders that were reminded, then completed)
        -- (This is a simplified guess for now: Counting 'completed' orders that have an event log)
        (
           SELECT COUNT(DISTINCT o.id)
           FROM orders o
           JOIN automation_events ae ON o.customer_id = ae.customer_id
           WHERE o.status = 'completed'
           AND o.created_at >= $1
           AND ae.event_type = 'abandoned_reminded'
        ) as recovered_count

      FROM orders
    `;

    const result = await db.query(query, [startOfDay]);
    return result.rows[0];
  } catch (err) {
    console.error("Analytics Error:", err);
    return {
      new_orders: 0,
      total_revenue: 0,
      abandoned_count: 0,
      lost_revenue_estimate: 0,
      recovered_count: 0,
    };
  }
}

module.exports = { getDailyStats };

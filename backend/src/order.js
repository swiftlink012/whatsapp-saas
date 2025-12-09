import { query } from "./db.js";

async function createAbandonendOrderEvent(customerId, amount) {
  try {
    const result = await query(
      `INSERT INTO orders(customer_id, amount, status) VALUES($1, $2, 'abandoned') RETURNING *;`,
      [customerId, amount]
    );
    console.log(
      `[event produced] abandoned order for customer ${customerId} created`
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error creating the abandoned order event:", err);
    throw new Error("Failed to create abandoned order");
  }
}

export default createAbandonendOrderEvent; /*


// --- PASTE THIS IN order.js ---

// The "Red Button" - Manually mark order as abandoned
// POST /api/orders/:id/abandon
router.post('/:id/abandon', async (req, res) => {
    const orderId = req.params.id;

    try {
        // 1. Update the Order Status to 'abandoned'
        // (This assumes you have a 'pool' or 'client' db connection imported at the top)
        const updateResult = await pool.query(
            "UPDATE orders SET status = 'abandoned', updated_at = NOW() WHERE id = $1 RETURNING *",
            [orderId]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const customerId = updateResult.rows[0].customer_id;

        // 2. PRODUCE THE EVENT (The requirement you need to fulfill)
        // We insert a record into 'automation_events' so the system knows this happened.
        await pool.query(
            `INSERT INTO automation_events (customer_id, event_type, metadata)
             VALUES ($1, 'manual_abandon', $2)`,
            [customerId, JSON.stringify({ triggered_by: 'admin_panel', order_id: orderId })]
        );

        res.json({ 
            message: "Order manually marked as abandoned", 
            orderId: orderId,
            event: "manual_abandon_produced"
        });

    } catch (error) {
        console.error("Error marking abandoned:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
});*/

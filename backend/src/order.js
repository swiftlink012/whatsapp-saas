const db = require("./db"); // <--- Fixed: Use require to match server.js

async function createAbandonedOrderEvent(customerId, amount) {
  try {
    // TRICK: We create a 'pending' order but set the time to 20 minutes ago.
    // This forces the Automation Worker to pick it up immediately.
    const result = await db.query(
      `INSERT INTO orders (customer_id, amount, status, items, created_at) 
       VALUES ($1, $2, 'pending', $3, NOW() - INTERVAL '20 minutes') 
       RETURNING *;`,
      [
        customerId,
        amount,
        JSON.stringify([{ name: "Premium Plan", price: amount }]), // Default item
      ]
    );

    console.log(
      `[Event Produced] Simulated abandoned order for customer ${customerId}`
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error creating the abandoned order event:", err);
    throw new Error("Failed to create abandoned order");
  }
}

// Fixed: Use module.exports instead of export default
module.exports = { createAbandonedOrderEvent };

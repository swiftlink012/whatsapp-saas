const express = require("express");
const { createAbandonedOrderEvent } = require("../order"); // Import the file we created in Step 2
const router = express.Router();

router.post("/abandon-cart", async (req, res) => {
  const { customer_id, amount } = req.body;

  // Validation
  if (!customer_id || typeof amount !== "number") {
    return res.status(400).json({ error: "Missing customer_id or amount" });
  }

  try {
    const newOrder = await createAbandonedOrderEvent(customer_id, amount);

    res.status(201).json({
      message: "Abandoned cart event successfully recorded.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Abandon Cart Route Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

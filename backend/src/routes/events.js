import express from "express";
import createAbandonendOrderEvent from "../order.js";

const router = express.Router();

router.post("/abandon-cart", async (req, res) => {
  const { customer_id, amount } = req.body;
  if (!customer_id || typeof amount != "number") {
    return res.status(400).json({
      error: "Missing customer_id or amount",
    });
  }
  try {
    const newOrder = await createAbandonendOrderEvent(customer_id, amount);
    res.status(201).json({
      message: "Abandoned cart event succcessfully recorded.",
      order: newOrder,
    });
  } catch (err) {
    console.errror("Abandon Cart Route Error:", err.message);
    res.status(500).json({
      error: "Interval server error.",
    });
  }
});

export default router;
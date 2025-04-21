const express = require("express");
const router = express.Router();
const Transaction = require("../models/transaction");

router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.findAll();

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Donation = require("../models/donation");

router.get("/", async (req, res) => {
  try {
    const donations = await Donation.getAll();

    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

module.exports = router;

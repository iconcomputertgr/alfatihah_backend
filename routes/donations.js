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

router.post("/", async (req, res) => {
  const { donatur_id, program_id, amount, donation_date, notes } = req.body;

  try {
    const donation = await Donation.create({
      donatur_id,
      program_id,
      amount,
      donation_date,
      notes,
    });

    const created = {
      id: donation.donatur_id,
      amount: donation.amount,
      note: donation.notes,
      donation_date: donation.donation_date,
      donatur: {
        id: donation.donatur_id,
        name: donation.donatur_name,
        phone: donation.donatur_phone,
      },
      program: {
        id: donation.program_id,
        name: donation.program_name,
      },
    };

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to create donation" });
  }
});

module.exports = router;

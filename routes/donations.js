const express = require("express");
const router = express.Router();
const Donation = require("../models/donation");

router.get("/", async (req, res) => {
  try {
    const donations = await Donation.getAll();

    res.json({
      success: true,
      data: donations.map((donation) => ({
        id: donation.donation_id,
        entry_number: donation.entry_number,
        amount: donation.amount,
        note: donation.notes,
        donation_date: donation.donation_date,
        received_date: donation.received_date,
        created_at: donation.created_at,
        donatur: {
          id: donation.donatur_id,
          name: donation.donatur_name,
          phone: donation.donatur_phone,
          address: donation.donatur_address,
        },
        program: {
          id: donation.program_id,
          name: donation.program_name,
          description: donation.program_description,
        },
        user: {
          id: donation.user_id,
          name: donation.user_name,
        },
        bank: {
          id: donation.bank_id,
          name: donation.bank_name,
        },
      })),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.getById(id);

    if (!donation) return res.status(404).json({ error: "Donation not found" });

    res.json({
      success: true,
      data: {
        id: donation.donation_id,
        entry_number: donation.entry_number,
        amount: donation.amount,
        note: donation.notes,
        donation_date: donation.donation_date,
        received_date: donation.received_date,
        donatur: {
          id: donation.donatur_id,
          name: donation.donatur_name,
          phone: donation.donatur_phone,
          gender: donation.donatur_gender,
          address: donation.donatur_address,
        },
        program: {
          id: donation.program_id,
          name: donation.program_name,
        },
        user: {
          id: donation.user_id,
          name: donation.user_name,
        },
        bank: {
          id: donation.bank_id,
          name: donation.bank_name,
        },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch donation" });
  }
});

router.post("/", async (req, res) => {
  const {
    entry_number,
    donatur,
    program,
    user,
    bank,
    amount,
    donation_date,
    received_date,
    note,
  } = req.body;

  try {
    const donation = await Donation.create({
      entry_number,
      donatur,
      program,
      user,
      bank,
      amount,
      donation_date,
      received_date,
      note,
    });

    const created = {
      id: donation.donatur_id,
      entry_number: donation.entry_number,
      donatur: {
        id: donation.donatur_id,
        name: donation.donatur_name,
        phone: donation.donatur_phone,
      },
      program: {
        id: donation.program_id,
        name: donation.program_name,
      },
      user: {
        id: donation.user_id,
        name: donation.user_name,
      },
      bank: {
        id: donation.bank_id,
        name: donation.bank_name,
      },
      amount: donation.amount,
      donation_date: donation.donation_date,
      received_date: donation.received_date,
      note: donation.notes,
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

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { donatur, program, user, bank, amount, donation_date, received_date, note } =
    req.body;

  try {
    const donation = await Donation.update({
      id,
      donatur,
      program,
      user,
      bank,
      amount,
      donation_date,
      received_date,
      note,
    });

    if (!donation) return res.status(404).json({ error: "Donation not found" });

    const updated = {
      id: donation.donatur_id,
      entry_number: donation.entry_number,
      donatur: {
        id: donation.donatur_id,
        name: donation.donatur_name,
        phone: donation.donatur_phone,
      },
      program: {
        id: donation.program_id,
        name: donation.program_name,
      },
      user: {
        id: donation.user_id,
        name: donation.user_name,
      },
      bank: {
        id: donation.bank_id,
        name: donation.bank_name,
      },
      amount: donation.amount,
      donation_date: donation.donation_date,
      received_date: donation.received_date,
      note: donation.notes,
    };

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to update donation" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.delete(id);

    res.json({
      success: true,
      data: "Donation deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to delete donation" });
  }
});

module.exports = router;

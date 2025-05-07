// routes/donations.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/donations
router.get('/', async (req, res, next) => {
  try {
    const [results] = await db.query(`
      SELECT 
        donasis.id              AS donation_id,
        donasis.amount,
        donasis.notes,
        donasis.donation_date,
        donaturs.id             AS donatur_id,
        donaturs.name           AS donatur_name,
        donaturs.phone          AS donatur_phone,
        programs.id             AS program_id,
        programs.name           AS program_name
      FROM donasis
      JOIN donaturs  ON donasis.donatur_id = donaturs.id
      JOIN programs  ON donasis.program_id = programs.id
      ORDER BY donasis.id DESC
    `);

    const data = results.map(donation => ({
      id:            donation.donation_id,
      amount:        donation.amount,
      note:          donation.notes,
      donation_date: donation.donation_date,
      donatur: {
        id:    donation.donatur_id,
        name:  donation.donatur_name,
        phone: donation.donatur_phone,
      },
      program: {
        id:   donation.program_id,
        name: donation.program_name,
      }
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/donations
router.post('/', async (req, res, next) => {
  try {
    const { donatur_id, program_id, amount, donation_date, notes } = req.body;

    // 1) Insert
    const [insertResult] = await db.query(
      `INSERT INTO donasis (donatur_id, program_id, amount, donation_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [donatur_id, program_id, amount, donation_date, notes]
    );
    const newId = insertResult.insertId;

    // 2) Re-fetch the just-inserted record (to include joins)
    const [rows] = await db.query(`
      SELECT 
        donasis.id              AS donation_id,
        donasis.amount,
        donasis.notes,
        donasis.donation_date,
        donaturs.id             AS donatur_id,
        donaturs.name           AS donatur_name,
        donaturs.phone          AS donatur_phone,
        programs.id             AS program_id,
        programs.name           AS program_name
      FROM donasis
      JOIN donaturs  ON donasis.donatur_id = donaturs.id
      JOIN programs  ON donasis.program_id = programs.id
      WHERE donasis.id = ?
    `, [newId]);

    if (!rows.length) {
      return res.status(500).json({ success: false, message: 'Failed to load newly created donation.' });
    }

    const d = rows[0];
    const created = {
      id:            d.donation_id,
      amount:        d.amount,
      note:          d.notes,
      donation_date: d.donation_date,
      donatur: { id: d.donatur_id, name: d.donatur_name, phone: d.donatur_phone },
      program: { id: d.program_id, name: d.program_name }
    };

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

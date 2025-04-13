// File: routes/donations.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust path to your db configuration

// GET /api/donations
router.get('/', async (req, res) => {
  try {
    // Example SQL join matching the 'donasis' table with 'donaturs' and 'programs'.
    const [rows] = await db.query(`
      SELECT 
        donasis.id AS donation_id,
        donasis.amount,
        donasis.notes,
        donasis.donation_date,
        donaturs.name AS donor_name,
        programs.name AS program_name
      FROM donasis
      JOIN donaturs ON donasis.donatur_id = donaturs.id
      JOIN programs ON donasis.program_id = programs.id
      ORDER BY donasis.id DESC
    `);

    // Return the rows as JSON
    res.json(rows);
  } catch (err) {
    console.error('Error fetching donation data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

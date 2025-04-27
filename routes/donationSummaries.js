// routes/donationSummaries.js  (add this inside your existing router)
const express = require('express');
const router  = express.Router();
const DonationSummary = require('../models/donationSummary');

router.get('/', async (req, res) => {
  let { start_date, end_date } = req.query;
  const today = new Date().toISOString().slice(0,10);

  if (!start_date) start_date = '1970-01-01';
  if (!end_date)   end_date   = today;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
    return res.status(400).json({ success: false, error: 'Dates must be YYYY-MM-DD' });
  }

  try {
    const data = await DonationSummary.getSummary({
      startDate: start_date,
      endDate:   end_date
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching donation summary:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch donation summary' });
  }
});

module.exports = router;

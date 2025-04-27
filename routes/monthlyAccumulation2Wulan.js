// File: backend/routes/monthlyAccumulation2Wulan.js

const express = require('express');
const router  = express.Router();
const MonthlyAccumulation2Wulan = require('../models/monthlyAccumulation2Wulan');

router.get('/', async (req, res) => {
  let { start_date, end_date } = req.query;
  const today = new Date().toISOString().slice(0, 10);

  if (!start_date) start_date = '1970-01-01';
  if (!end_date)   end_date   = today;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
    return res
      .status(400)
      .json({ success: false, error: 'Dates must be YYYY-MM-DD' });
  }

  try {
    const data = await MonthlyAccumulation2Wulan.getMonthlyAccumulation({
      startDate: start_date,
      endDate:   end_date
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching monthly accumulation:', err);
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch accumulation' });
  }
});

module.exports = router;

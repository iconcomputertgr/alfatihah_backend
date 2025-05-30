const express = require('express');
const db = require('../config/db');
const router = express.Router();

// 1. Rata-rata Donasi
router.get('/rata-donasi', async (req, res) => {
  try {
    const [[{ avg_donation }]] = await db.query(`
      SELECT COALESCE(ROUND(AVG(amount), 2), 0) AS avg_donation
      FROM donasis
    `);
    res.json({ avg_donation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Rata-rata Donasi per Donor Aktif (12 bln)
router.get('/rata-per-donor-aktif', async (req, res) => {
  try {
    const [[{ value }]] = await db.query(`
      SELECT COALESCE(
        ROUND(
          COUNT(*) / NULLIF(COUNT(DISTINCT donatur_id), 0)
        , 2)
      , 0) AS value
      FROM donasis
      WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    `);
    res.json({ value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Pendapatan Bersih per Donor Aktif (12 bln)
router.get('/net-per-donor-aktif', async (req, res) => {
  try {
    const [[{ value }]] = await db.query(`
      SELECT COALESCE(
        ROUND(
          SUM(amount) / NULLIF(COUNT(DISTINCT donatur_id), 0)
        , 2)
      , 0) AS value
      FROM donasis
      WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    `);
    res.json({ value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. Tingkat Donor Aktif (%)
router.get('/tingkat-donor-aktif', async (req, res) => {
  try {
    const [[{ rate }]] = await db.query(`
      SELECT COALESCE(
        ROUND(
          COUNT(DISTINCT CASE
            WHEN donation_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
            THEN donatur_id END)
          / NULLIF(COUNT(DISTINCT donatur_id), 0)
          * 100
        , 2)
      , 0) AS rate
      FROM donasis
    `);
    res.json({ rate });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5. Total Donor
router.get('/total-donor', async (req, res) => {
  try {
    const [[{ total }]] = await db.query(`
      SELECT COALESCE(COUNT(DISTINCT donatur_id), 0) AS total
      FROM donasis
    `);
    res.json({ total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6. Donor Utama (total donasi ≥ threshold)
router.get('/donor-utama', async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10000;
    const [[{ count }]] = await db.query(`
      SELECT COALESCE(COUNT(*), 0) AS count
      FROM (
        SELECT donatur_id, SUM(amount) AS total
        FROM donasis
        GROUP BY donatur_id
        HAVING total >= ?
      ) t
    `, [threshold]);
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 7. Total Donor Bulan Ini
router.get('/donor-bulan-ini', async (req, res) => {
  try {
    const [[{ total }]] = await db.query(`
      SELECT COALESCE(
        COUNT(DISTINCT donatur_id)
      , 0) AS total
      FROM donasis
      WHERE YEAR(donation_date) = YEAR(CURDATE())
        AND MONTH(donation_date) = MONTH(CURDATE())
    `);
    res.json({ total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 8. Total Donor Minggu Ini
router.get('/donor-minggu-ini', async (req, res) => {
  try {
    const [[{ total }]] = await db.query(`
      SELECT COALESCE(
        COUNT(DISTINCT donatur_id)
      , 0) AS total
      FROM donasis
      WHERE YEARWEEK(donation_date, 1) = YEARWEEK(CURDATE(), 1)
    `);
    res.json({ total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

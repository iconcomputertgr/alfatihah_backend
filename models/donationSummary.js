// models/donationSummary.js
const db = require('../config/db');

const DonationSummary = {
  /**
   * Returns an array of:
   *  { program: string, count: number, total: number }
   * for donations between startDate and endDate (inclusive).
   */
  async getSummary({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
         p.name        AS program,
         COUNT(d.id)   AS count,
         SUM(d.amount) AS total
       FROM donations d
       JOIN programs p ON d.program_id = p.id
       WHERE DATE(d.created_at) BETWEEN ? AND ?
       GROUP BY p.name
       ORDER BY total DESC`,
      [startDate, endDate]
    );

    return rows.map(r => ({
      program: r.program,
      count:   r.count,
      total:   r.total
    }));
  }
};

module.exports = DonationSummary;

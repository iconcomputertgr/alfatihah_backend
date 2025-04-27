// File: backend/models/monthlyAccumulation2Wulan.js

const db = require('../config/db');

const MonthlyAccumulation2Wulan = {
  /**
   * Returns an array of
   *   { month: 'YYYY-MM', total: number }
   * for each month between startDate and endDate (inclusive).
   */
  async getMonthlyAccumulation({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
         DATE_FORMAT(transaction_date, '%Y-%m')    AS month,
         IFNULL(SUM(amount), 0)                   AS total
       FROM transaksis
       WHERE DATE(transaction_date) BETWEEN ? AND ?
       GROUP BY month
       ORDER BY month`,
      [startDate, endDate]
    );

    return rows.map(r => ({
      month: r.month,
      total:  parseFloat(r.total)
    }));
  }
};

module.exports = MonthlyAccumulation2Wulan;

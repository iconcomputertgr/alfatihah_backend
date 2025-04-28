const db = require("../config/db");

const DailyTransactionsRta = {
  /**
   * Returns an array of raw transactions between startDate and endDate (inclusive):
   *  { id, donor, program, bank, amount, date, status }
   */
  async getDailyTransactions({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
        t.id,
        d.name AS donor,
        p.name AS program,
        IFNULL(b.name, '') AS bank,
        t.amount,
        DATE(t.transaction_date) AS date,
        t.status
      FROM transaksis t
      JOIN donaturs d
        ON t.donatur_id = d.id
      JOIN programs p
        ON t.program_id = p.id
      LEFT JOIN banks b
        ON t.bank_id = b.id
      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
      ORDER BY t.transaction_date`,
      [startDate, endDate]
    );

    return rows;
  },
};

module.exports = DailyTransactionsRta;

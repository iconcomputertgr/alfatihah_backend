const db = require("../config/db");

const FundingBankProgramRta = {
  /**
   * Returns an array of:
   *   { bank: string, program: string, total: number }
   * for each bank & program between startDate and endDate (inclusive).
   */
  async getByBankAndProgram({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
        IFNULL(b.name, 'Unknown') AS bank,
        p.name AS program,
        IFNULL(SUM(t.amount),0) AS total
      FROM transaksis t
      JOIN programs p
        ON t.program_id = p.id
      LEFT JOIN banks b
        ON t.bank_id = b.id
      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
      GROUP BY b.name, p.name
      ORDER BY b.name, p.name`,
      [startDate, endDate]
    );
    return rows.map((r) => ({
      bank: r.bank,
      program: r.program,
      total: parseFloat(r.total),
    }));
  },
};

module.exports = FundingBankProgramRta;

const db = require('../config/db');

const ProgramFundAllocation = {
  /**
   * Returns an array of:
   *   { program: string, target: number, actual: number, achievement: number }
   * for each program between startDate and endDate (inclusive).
   */
  async getAllocations({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
         p.name               AS program,
         p.target_amount      AS target,
         IFNULL(SUM(d.amount),0) AS actual,
         ROUND(IFNULL(SUM(d.amount),0)/p.target_amount * 100, 2) AS achievement
       FROM programs p
       LEFT JOIN donations d
         ON d.program_id = p.id
         AND DATE(d.created_at) BETWEEN ? AND ?
       GROUP BY p.name, p.target_amount
       ORDER BY achievement DESC`,
      [startDate, endDate]
    );

    return rows.map(r => ({
      program:     r.program,
      target:      r.target,
      actual:      r.actual,
      achievement: r.achievement,
    }));
  }
};

module.exports = ProgramFundAllocation;

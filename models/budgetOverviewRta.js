const db = require("../config/db");

const BudgetOverviewRta = {
  /**
   * Returns an array of:
   *   { program: string, target: number, actual: number, achievement: number }
   * for each program between startDate and endDate (inclusive).
   */
  async getBudgetOverview({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
        p.name AS program,
        p.target_amount AS target,
        IFNULL(SUM(t.amount), 0) AS actual,
        ROUND(
          IFNULL(SUM(t.amount),0) / NULLIF(p.target_amount,0) * 100,
          2
        ) AS achievement
      FROM programs p
      LEFT JOIN donasis t
        ON t.program_id = p.id
        AND DATE(t.donation_date) BETWEEN ? AND ?
      GROUP BY p.id, p.name, p.target_amount
      ORDER BY p.name`,
      [startDate, endDate]
    );

    return rows.map((r) => ({
      program: r.program,
      target: parseFloat(r.target),
      actual: parseFloat(r.actual),
      achievement: parseFloat(r.achievement),
    }));
  },
};

module.exports = BudgetOverviewRta;

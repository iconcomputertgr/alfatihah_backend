const db = require('../config/db');

const CsPerformance = {
  /**
   * Returns an array of: { csId, csName, count, total }
   * for donations handled by each CS between startDate and endDate.
   */
  async getPerformance({ startDate, endDate }) {
    const [rows] = await db.query(
      `SELECT
         u.id          AS csId,
         u.name        AS csName,
         COUNT(d.id)   AS count,
         SUM(d.amount) AS total
       FROM donations d
       JOIN users u ON d.user_id = u.id
       WHERE DATE(d.created_at) BETWEEN ? AND ?
       GROUP BY u.id, u.name
       ORDER BY count DESC`,
      [startDate, endDate]
    );

    return rows.map(r => ({
      csId:   r.csId,
      csName: r.csName,
      count:  r.count,
      total:  r.total
    }));
  }
};

module.exports = CsPerformance;

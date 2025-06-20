// services/functions.js
const db = require("../config/db"); // sesuaikan path jika config/db.js ada di tempat lain

/**
 * Ambil metrik donasi dari database.
 * @param {Object} options
 * @param {"total_donasi"|"top_donor"|"average_donasi"} options.metric
 * @param {"day"|"week"|"month"|"year"} options.periodType
 * @param {string} [options.startDate]  // format 'YYYY-MM-DD'
 * @param {string} [options.endDate]    // format 'YYYY-MM-DD'
 */
async function getDonationMetrics({ metric, periodType, startDate, endDate }) {
  // Putuskan tanggal range
  let whereClause = "";
  if (startDate && endDate) {
    whereClause = `WHERE date BETWEEN ? AND ?`;
  } else {
    const intervalMap = { day: 1, week: 7, month: 30, year: 365 };
    const days = intervalMap[periodType] || 7;
    whereClause = `WHERE date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
  }

  let sql, params = [];
  switch (metric) {
    case "total_donasi":
      sql = `SELECT SUM(amount) AS value FROM donations ${whereClause}`;
      if (startDate && endDate) params = [startDate, endDate];
      break;

    case "top_donor":
      sql = `
        SELECT donor_name AS name, SUM(amount) AS total 
        FROM donations 
        ${whereClause} 
        GROUP BY donor_name 
        ORDER BY total DESC 
        LIMIT 1
      `;
      if (startDate && endDate) params = [startDate, endDate];
      break;

    case "average_donasi":
      sql = `SELECT AVG(amount) AS value FROM donations ${whereClause}`;
      if (startDate && endDate) params = [startDate, endDate];
      break;

    default:
      throw new Error(`Unknown metric "${metric}"`);
  }

  const [rows] = await db.execute(sql, params);
  return rows[0]; // { value: 12345 } atau { name: "A", total: 67890 }
}

module.exports = { getDonationMetrics };

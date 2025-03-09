const db = require('../config/db');

const User = {
  async create(email, password) {
    const [result] = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, password]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async updateOtp(email, otp) {
    await db.query('UPDATE users SET temp_otp = ? WHERE email = ?', [otp, email]);
  },

  async clearOtp(email) {
    await db.query('UPDATE users SET temp_otp = NULL WHERE email = ?', [email]);
  },
};

module.exports = User;
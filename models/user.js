const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async create(email, password, name = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, approved) VALUES (?, ?, ?, 0)',
      [email, hashedPassword, name]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(userId) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
  },

  async updateOtp(email, otp) {
    await db.query(
      'UPDATE users SET temp_otp = ?, temp_otp_expiry = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE email = ?',
      [otp, email]
    );
  },

  async clearOtp(email) {
    await db.query(
      'UPDATE users SET temp_otp = NULL, temp_otp_expiry = NULL WHERE email = ?',
      [email]
    );
  },

  async updateLoginSuccess(email, token) {
    await db.query(
      'UPDATE users SET last_login_at = NOW(), failed_login_attempts = 0, remember_token = ? WHERE email = ?',
      [token, email]
    );
  },

  async incrementFailedLoginAttempts(email) {
    await db.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE email = ?',
      [email]
    );
    const user = await this.findByEmail(email);
    if (user.failed_login_attempts >= 5) {
      await db.query(
        'UPDATE users SET locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?',
        [email]
      );
    }
  },

  async resetFailedLoginAttempts(email) {
    await db.query(
      'UPDATE users SET failed_login_attempts = 0 WHERE email = ?',
      [email]
    );
  },

  async enable2FA(email) {
    await db.query(
      'UPDATE users SET two_fa_enabled = 1 WHERE email = ?',
      [email]
    );
  },

  async approveUser(userId) {
    await db.query(
      'UPDATE users SET approved = 1 WHERE id = ?',
      [userId]
    );
  },

  async getPendingUsers() {
    const [rows] = await db.query('SELECT id, name, email, created_at FROM users WHERE approved = 0');
    return rows;
  },

  async lockAccount(email, until) {
    await db.query(
      'UPDATE users SET locked_until = ? WHERE email = ?',
      [until, email]
    );
  },
};

module.exports = User;

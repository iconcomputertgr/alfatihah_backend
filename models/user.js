// models/user.js

const db = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  // Create a new user (or update email on duplicate)
  async create(
    name,
    email,
    password,
    role = "user",
    is_active = 0,
    approved = 0,
    profile_picture = "assets/images/default_profile.png",
    theme = "light"
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `
      INSERT INTO users 
        (name, email, password, role, is_active, approved, profile_picture, theme)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        email = ?
      `,
      [
        name,
        email,
        hashedPassword,
        role,
        is_active,
        approved,
        profile_picture,
        theme,
        email,
      ]
    );
    return result;
  },

  // Fetch by email
  async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0];
  },

  // Fetch by ID (including theme)
  async findById(userId) {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        name,
        email,
        password,
        role,
        is_active,
        approved,
        profile_picture,
        theme,
        temp_otp,
        temp_otp_expiry,
        two_fa_enabled,
        last_login_at,
        failed_login_attempts,
        locked_until,
        remember_token
      FROM users 
      WHERE id = ?
      `,
      [userId]
    );
    return rows[0];
  },

  // OTP management
  async updateOtp(email, otp) {
    await db.query(
      `
      UPDATE users 
      SET 
        temp_otp = ?, 
        temp_otp_expiry = DATE_ADD(NOW(), INTERVAL 5 MINUTE) 
      WHERE email = ?
      `,
      [otp, email]
    );
  },
  async clearOtp(email) {
    await db.query(
      `
      UPDATE users 
      SET 
        temp_otp = NULL, 
        temp_otp_expiry = NULL 
      WHERE email = ?
      `,
      [email]
    );
  },

  // Login tracking
  async updateLoginSuccess(email, token) {
    await db.query(
      `
      UPDATE users 
      SET 
        last_login_at = NOW(), 
        failed_login_attempts = 0, 
        remember_token = ?
      WHERE email = ?
      `,
      [token, email]
    );
  },
  async incrementFailedLoginAttempts(email) {
    await db.query(
      `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1 
      WHERE email = ?
      `,
      [email]
    );
    const user = await this.findByEmail(email);
    if (user.failed_login_attempts >= 5) {
      await db.query(
        `
        UPDATE users 
        SET locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) 
        WHERE email = ?
        `,
        [email]
      );
    }
  },
  async resetFailedLoginAttempts(email) {
    await db.query(
      `UPDATE users SET failed_login_attempts = 0 WHERE email = ?`,
      [email]
    );
  },

  // Two-factor authentication
  async enable2FA(email) {
    await db.query(
      `UPDATE users SET two_fa_enabled = 1 WHERE email = ?`,
      [email]
    );
  },

  // Approval & locking
  async approveUser(userId) {
    await db.query(`UPDATE users SET approved = 1 WHERE id = ?`, [userId]);
  },
  async getPendingUsers() {
    const [rows] = await db.query(
      `SELECT id, name, email, created_at FROM users WHERE approved = 0`
    );
    return rows;
  },
  async lockAccount(email, until) {
    await db.query(`UPDATE users SET locked_until = ? WHERE email = ?`, [
      until,
      email,
    ]);
  },

  // Trusted device support
  async createTrustedDevice(userId, deviceToken, ipAddress, userAgent, expiry) {
    await db.query(
      `
      INSERT INTO trusted_devices 
        (user_id, device_token, ip_address, user_agent, expires_at) 
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, deviceToken, ipAddress, userAgent, expiry]
    );
  },
  async isTrustedDevice(userId, deviceToken) {
    const [rows] = await db.query(
      `
      SELECT 1 FROM trusted_devices 
      WHERE user_id = ? 
        AND device_token = ? 
        AND expires_at > NOW()
      `,
      [userId, deviceToken]
    );
    return rows.length > 0;
  },

  // List all users (includes theme column)
  async findAll() {
    const [rows] = await db.query(
      `
      SELECT 
        id, name, email, role, is_active, approved, profile_picture, theme 
      FROM users 
      ORDER BY name ASC
      `
    );
    return rows;
  },

  // Update profile (now handles theme)
  async update(
    id,
    { name, email, role = "user", is_active = 0, approved = 0, profile_picture, theme = "light" }
  ) {
    const fields = [
      "name = ?",
      "email = ?",
      "role = ?",
      "is_active = ?",
      "approved = ?",
      "theme = ?",
    ];
    const values = [name, email, role, is_active, approved, theme];

    if (profile_picture) {
      fields.push("profile_picture = ?");
      values.push(profile_picture);
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return result;
  },

  // Delete a user
  async delete(id) {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result;
  },

  // Change password
  async updatePassword(id, password) {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, id]
    );
    return result;
  },

  // Permission helper
  async getUserPermissions(userId) {
    const [rows] = await db.query(
      `
      SELECT p.id, p.name 
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ?
      `,
      [userId]
    );
    return rows;
  },
};

module.exports = User;

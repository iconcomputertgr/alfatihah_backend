const db = require("../config/db");
const { update } = require("./user");

const Permission = {
  async findAll() {
    const [results] = await db.query("SELECT * FROM permissions");

    return results;
  },

  async assignToUser(userId, permissionIds) {
    for (const permId of permissionIds) {
      await db.query(
        "INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)",
        [userId, permId]
      );
    }
  },

  async removeFromUser(userId) {
    await db.query("DELETE FROM user_permissions WHERE user_id = ?", [userId]);
  },
};

module.exports = Permission;

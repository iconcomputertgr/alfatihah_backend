const db = require("../config/db");

const Bank = {
  async getAll() {
    const [results] = await db.query("SELECT * FROM banks ORDER BY name ASC");

    return results;
  },

  async getById(id) {
    const [result] = await db.query("SELECT * FROM banks WHERE id = ?", [id]);

    return result[0];
  },

  async create({ name, account_number, account_holder, logo }) {
    console.log(name, account_number, account_holder, logo);

    const [result] = await db.query(
      `INSERT INTO banks (name, account_number, account_holder, logo) VALUES (?, ?, ?, ?)`,
      [name, account_number, account_holder, logo]
    );

    const id = result.insertId;

    return this.getById(id);
  },

  async update(id, { name, account_number, account_holder, logo }) {
    const fields = ["name = ?", "account_number = ?", "account_holder = ?"];
    const values = [name, account_number, account_holder];

    if (logo) {
      fields.push("logo = ?");
      values.push(logo);
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE banks SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.getById(id);
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM banks WHERE id = ?", [id]);

    return result;
  },
};

module.exports = Bank;

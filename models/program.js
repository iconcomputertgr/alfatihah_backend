const db = require("../config/db");

const Program = {
  async getAll() {
    const [results] = await db.query("SELECT * FROM programs");

    return results;
  },

  async getById(id) {
    const [result] = await db.query("SELECT * FROM programs WHERE id = ?", [
      id,
    ]);

    return result[0];
  },

  async create({ name, description, target_amount, start_date, end_date }) {
    const [result] = await db.query(
      "INSERT INTO programs (name, description, target_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
      [name, description, target_amount, start_date, end_date]
    );

    return result;
  },

  async update(id, { name, description, target_amount, start_date, end_date }) {
    const [result] = await db.query(
      "UPDATE programs SET name = ?, description = ?, target_amount = ?, start_date = ?, end_date = ? WHERE id = ?",
      [name, description, target_amount, start_date, end_date, id]
    );

    return result;
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM programs WHERE id = ?", [id]);

    return result;
  },
};

module.exports = Program;

const db = require('../config/db');

const Program = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM programs');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, description, target_amount, start_date, end_date }) {
    const [result] = await db.query(
      'INSERT INTO programs (name, description, target_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [name, description, target_amount, start_date, end_date]
    );
    return { id: result.insertId, name, description, target_amount, start_date, end_date };
  },

  async update(id, { name, description, target_amount, start_date, end_date }) {
    await db.query(
      'UPDATE programs SET name = ?, description = ?, target_amount = ?, start_date = ?, end_date = ? WHERE id = ?',
      [name, description, target_amount, start_date, end_date, id]
    );
    return await this.getById(id);
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM programs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Program;

const db = require('../config/db');

const Donatur = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM donaturs');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM donaturs WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ user_id, name, email, phone, address }) {
    const [result] = await db.query(
      'INSERT INTO donaturs (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [user_id, name, email, phone, address]
    );
    return { id: result.insertId, user_id, name, email, phone, address };
  },

  async update(id, { user_id, name, email, phone, address }) {
    await db.query(
      'UPDATE donaturs SET user_id = ?, name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [user_id, name, email, phone, address, id]
    );
    return await this.getById(id);
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM donaturs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Donatur;

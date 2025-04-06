const db = require('../config/db');

const Bank = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM banks');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM banks WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, account_number, account_holder }) {
    const [result] = await db.query(
      'INSERT INTO banks (name, account_number, account_holder) VALUES (?, ?, ?)',
      [name, account_number, account_holder]
    );
    return { id: result.insertId, name, account_number, account_holder };
  },

  async update(id, { name, account_number, account_holder }) {
    await db.query(
      'UPDATE banks SET name = ?, account_number = ?, account_holder = ? WHERE id = ?',
      [name, account_number, account_holder, id]
    );
    return await this.getById(id);
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM banks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Bank;

const db = require('../config/db');

const Bank = {
  async getAll() {
    // SELECT * will include logo_base64 now
    const [rows] = await db.query('SELECT * FROM banks');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM banks WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, account_number, account_holder, logo_base64 }) {
    const [result] = await db.query(
      `INSERT INTO banks 
         (name, account_number, account_holder, logo_base64) 
       VALUES (?, ?, ?, ?)`,
      [name, account_number, account_holder, logo_base64]
    );
    // return the newly created record shape
    return {
      id: result.insertId,
      name,
      account_number,
      account_holder,
      logo_base64
    };
  },

  async update(id, { name, account_number, account_holder, logo_base64 }) {
    await db.query(
      `UPDATE banks 
         SET name           = ?,
             account_number = ?,
             account_holder = ?,
             logo_base64    = ?
       WHERE id = ?`,
      [name, account_number, account_holder, logo_base64, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM banks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Bank;

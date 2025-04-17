const db = require("../config/db");

const Donatur = {
  async getAll() {
    const [result] = await db.query(`
      SELECT 
        donaturs.*, 
        users.id as user_id, 
        users.name as user_name
      FROM donaturs 
      JOIN users ON donaturs.user_id = users.id 
      ORDER BY donaturs.created_at DESC
    `);

    return result.map((donatur) => ({
      id: donatur.id,
      user: {
        id: donatur.user_id,
        name: donatur.user_name,
      },
      name: donatur.name,
      email: donatur.email,
      phone: donatur.phone,
      address: donatur.address,
    }));
  },

  async getById(id) {
    const [result] = await db.query("SELECT * FROM donaturs WHERE id = ?", [
      id,
    ]);

    return result[0];
  },

  async create({ user_id, name, email, phone, address }) {
    const [result] = await db.query(
      "INSERT INTO donaturs (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)",
      [user_id, name, email, phone, address]
    );

    return result;
  },

  async update(id, { user_id, name, email, phone, address }) {
    const [result] = await db.query(
      "UPDATE donaturs SET user_id = ?, name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [user_id, name, email, phone, address, id]
    );

    return result;
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM donaturs WHERE id = ?", [id]);

    return result;
  },
};

module.exports = Donatur;

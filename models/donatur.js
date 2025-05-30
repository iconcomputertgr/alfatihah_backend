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
      gender: donatur.gender,
      address: donatur.address,
    }));
  },

  async getById(id) {
    const [result] = await db.query(
      "SELECT donaturs.*, users.id as user_id, users.name as user_name FROM donaturs JOIN users ON donaturs.user_id = users.id WHERE donaturs.id = ?",
      [id]
    );

    return {
      id: result[0].id,
      user: {
        id: result[0].user_id,
        name: result[0].user_name,
      },
      name: result[0].name,
      email: result[0].email,
      phone: result[0].phone,
      gender: result[0].gender,
      address: result[0].address,
    };
  },

  async create({ user_id, name, email, phone, gender, address }) {
    const [result] = await db.query(
      "INSERT INTO donaturs (user_id, name, email, phone, gender, address) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, name, email, phone, gender, address]
    );

    return result;
  },

  async update(id, { user_id, name, email, phone, gender, address }) {
    const [result] = await db.query(
      "UPDATE donaturs SET user_id = ?, name = ?, email = ?, phone = ?, gender = ?, address = ? WHERE id = ?",
      [user_id, name, email, phone, gender, address, id]
    );

    return result;
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM donaturs WHERE id = ?", [id]);

    return result;
  },
};

module.exports = Donatur;

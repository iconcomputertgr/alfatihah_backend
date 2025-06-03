const db = require("../config/db");

const Donation = {
  async getAll() {
    const [results] = await db.query(`
      SELECT 
        donasis.id AS donation_id,
        donasis.entry_number,
        donasis.amount,
        donasis.notes,
        donasis.donation_date,
        donasis.received_date,
        donasis.created_at,
        donaturs.id AS donatur_id,
        donaturs.name AS donatur_name,
        donaturs.phone AS donatur_phone,
        donaturs.gender AS donatur_gender,
        donaturs.address AS donatur_address,
        programs.id AS program_id,
        programs.name AS program_name,
        programs.description AS program_description,
        users.id AS user_id,
        users.name AS user_name,
        banks.id AS bank_id,
        banks.name AS bank_name
      FROM donasis
        JOIN donaturs ON donasis.donatur_id = donaturs.id
        JOIN programs ON donasis.program_id = programs.id
        JOIN users ON donasis.user_id = users.id
        JOIN banks ON donasis.bank_id = banks.id
      ORDER BY donasis.id DESC
    `);

    return results;
  },

  async getById(id) {
    const [result] = await db.query(
      `SELECT 
        donasis.id AS donation_id,
        donasis.entry_number,
        donasis.amount,
        donasis.notes,
        donasis.donation_date,
        donasis.received_date,
        donaturs.id AS donatur_id,
        donaturs.name AS donatur_name,
        donaturs.phone AS donatur_phone,
        donaturs.gender AS donatur_gender,
        donaturs.address AS donatur_address,
        programs.id AS program_id,
        programs.name AS program_name,
        users.id AS user_id,
        users.name AS user_name,
        banks.id AS bank_id,
        banks.name AS bank_name
      FROM donasis
      JOIN donaturs ON donasis.donatur_id = donaturs.id
      JOIN programs ON donasis.program_id = programs.id
      JOIN users ON donasis.user_id = users.id
      WHERE donasis.id = ?`,
      [id]
    );

    return result[0];
  },

  async create({
    entry_number,
    donatur,
    program,
    user,
    bank,
    amount,
    donation_date,
    received_date,
    note,
  }) {
    const [insertResult] = await db.query(
      `INSERT INTO donasis (entry_number, donatur_id, program_id, user_id, bank_id, amount, donation_date, received_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry_number,
        donatur.id,
        program.id,
        user.id,
        bank.id,
        amount,
        donation_date,
        received_date,
        note,
      ]
    );

    const newId = insertResult.insertId;

    const [rows] = await db.query(
      `SELECT 
          donasis.id AS donation_id,
          donasis.amount,
          donasis.notes,
          donasis.donation_date,
          donasis.received_date,
          donaturs.id AS donatur_id,
          donaturs.name AS donatur_name,
          donaturs.phone AS donatur_phone,
          programs.id AS program_id,
          programs.name AS program_name,
          users.id AS user_id,
          users.name AS user_name,
          banks.id AS bank_id,
          banks.name AS bank_name
        FROM donasis
        JOIN donaturs ON donasis.donatur_id = donaturs.id
        JOIN programs ON donasis.program_id = programs.id
        JOIN users ON donasis.user_id = users.id
        WHERE donasis.id = ?`,
      [newId]
    );

    if (!rows.length) {
      throw new Error("Failed to load newly created donation.");
    }

    return rows[0];
  },

  async update({
    id,
    donatur,
    program,
    user,
    bank,
    amount,
    donation_date,
    received_date,
    note,
  }) {
    const [result] = await db.query(
      `UPDATE donasis SET donatur_id = ?, program_id = ?, user_id = ?, bank_id = ?, amount = ?, donation_date = ?, received_date = ?, notes = ? WHERE id = ?`,
      [
        donatur.id,
        program.id,
        user.id,
        bank.id,
        amount,
        donation_date,
        received_date,
        note,
        id,
      ]
    );

    const [rows] = await db.query(
      `SELECT 
          donasis.id AS donation_id,
          donasis.amount,
          donasis.notes,
          donasis.donation_date,
          donasis.received_date,
          donaturs.id AS donatur_id,
          donaturs.name AS donatur_name,
          donaturs.phone AS donatur_phone,
          programs.id AS program_id,
          programs.name AS program_name,
          users.id AS user_id,
          users.name AS user_name,
          banks.id AS bank_id,
          banks.name AS bank_name
        FROM donasis
        JOIN donaturs ON donasis.donatur_id = donaturs.id
        JOIN programs ON donasis.program_id = programs.id
        JOIN users ON donasis.user_id = users.id
        WHERE donasis.id = ?`,
      [id]
    );

    if (!rows.length) {
      throw new Error("Failed to load newly updated donation.");
    }

    return rows[0];
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM donasis WHERE id = ?", [id]);

    return result;
  },
};

module.exports = Donation;

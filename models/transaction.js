const db = require("../config/db");

const Transaction = {
  async findAll() {
    const [results] = await db.query(`
      SELECT 
        transaksis.*,
        donaturs.id as donatur_id,
        donaturs.name as donatur_name,
        donaturs.phone as donatur_phone,
        donaturs.address as donatur_address,
        programs.id as program_id,
        programs.name as program_name,
        programs.description as program_description,
        banks.id as bank_id,
        banks.name as bank_name
      FROM transaksis
      JOIN donaturs ON transaksis.donatur_id = donaturs.id
      JOIN programs ON transaksis.program_id = programs.id
      JOIN banks ON transaksis.bank_id = banks.id
      ORDER BY transaksis.created_at DESC
    `);

    return results.map((transaction) => ({
      id: transaction.id,
      donatur: {
        id: transaction.donatur_id,
        name: transaction.donatur_name,
        phone: transaction.donatur_phone,
        address: transaction.donatur_address,
      },
      program: {
        id: transaction.program_id,
        name: transaction.program_name,
        description: transaction.program_description,
      },
      bank: {
        id: transaction.bank_id,
        name: transaction.bank_name,
      },
      amount: transaction.amount,
      notes: transaction.notes,
      transaction_date: transaction.transaction_date,
      status: transaction.status,
    }));
  },
};

module.exports = Transaction;

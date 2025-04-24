const db = require("../config/db");

const Donation = {
  async getAll() {
    const [results] = await db.query(`
      SELECT 
        donasis.id AS donation_id,
        donasis.amount,
        donasis.notes,
        donasis.donation_date,
        donaturs.id AS donatur_id,
        donaturs.name AS donatur_name,
        donaturs.phone AS donatur_phone,
        programs.id AS program_id,
        programs.name AS program_name
      FROM donasis
        JOIN donaturs ON donasis.donatur_id = donaturs.id
        JOIN programs ON donasis.program_id = programs.id
      ORDER BY donasis.id DESC
    `);

    return results.map((donation) => ({
      id: donation.donation_id,
      amount: donation.amount,
      notes: donation.notes,
      donation_date: donation.donation_date,
      donatur: {
        id: donation.donatur_id,
        name: donation.donatur_name,
        phone: donation.donatur_phone,
      },
      program: {
        id: donation.program_id,
        name: donation.program_name,
      },
    }));
  },
};

module.exports = Donation;

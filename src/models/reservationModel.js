const pool = require('../db');

const createReservation = async (reservation) => {
  const {
    date,
    time,
    customerName,
    guestCount,
    employeeName,
    tableNumber,
    phoneNumber,
  } = reservation;
  const result = await pool.query(
    'INSERT INTO reservations (date, time, customer_name, guest_count, employee_name, table_number, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [date, time, customerName, guestCount, employeeName, tableNumber, phoneNumber]
  );
  return result.rows[0];
};

const getReservations = async () => {
  const result = await pool.query('SELECT * FROM reservations');
  return result.rows;
};

module.exports = {
  createReservation,
  getReservations,
};

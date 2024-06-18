const reservationModel = require('../models/reservationModel');

const createReservation = async (req, res) => {
  try {
    const newReservation = await reservationModel.createReservation(req.body);
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReservations = async (req, res) => {
  try {
    const reservations = await reservationModel.getReservations();
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReservation,
  getReservations,
};

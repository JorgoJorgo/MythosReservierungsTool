const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');

// Route zum Erstellen von Reservierungen
router.post(
  '/',
  [
    auth,
    check('date', 'Date is required').notEmpty(),
    check('time', 'Time is required').notEmpty(),
    check('customer_name', 'Customer name is required').notEmpty(),
    check('guest_count', 'Guest count is required and should be a number').isInt(),
    check('employee_name', 'Employee name is required').notEmpty(),
    check('table_number', 'Table number is required and should be a number').isInt(),
    check('phone_number', 'Phone number is required').notEmpty()
  ],
  async (req, res) => {
    // Überprüfen, ob Validierungsfehler vorliegen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extrahiere Benutzer-ID aus dem JWT-Token
    console.log('[POST /api/reservations] User ID from JWT:', req.user.id);

    // Extrahiere Reservierungsdaten aus der Anfrage
    console.log('[POST /api/reservations] Request body:', req.body);
    const { date, time, customer_name, guest_count, employee_name, table_number, phone_number } = req.body;

    try {
      // Füge die Reservierungsdaten in die Datenbank ein
      const newReservation = await pool.query(
        'INSERT INTO reservations (date, time, customer_name, guest_count, employee_name, table_number, phone_number, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [date, time, customer_name, guest_count, employee_name, table_number, phone_number, req.user.id]
      );
      console.log('[POST /api/reservations] New reservation:', newReservation.rows[0]);

      // Sende eine Bestätigung der erfolgreichen Reservierung zurück
      res.json(newReservation.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Alle Reservierungen abrufen
router.get('/', auth, async (req, res) => {
  try {
    // Alle Reservierungen aus der Datenbank abrufen
    const reservations = await pool.query('SELECT * FROM reservations');
    console.log('[GET /api/reservations] All reservations:', reservations.rows);
    res.json(reservations.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Reservierung aktualisieren
router.put(
  '/:id',
  [
    auth,
    check('date', 'Date is required').notEmpty(),
    check('time', 'Time is required').notEmpty(),
    check('customer_name', 'Customer name is required').notEmpty(),
    check('guest_count', 'Guest count is required and should be a number').isInt(),
    check('employee_name', 'Employee name is required').notEmpty(),
    check('table_number', 'Table number is required and should be a number').isInt(),
    check('phone_number', 'Phone number is required').notEmpty()
  ],
  async (req, res) => {
    // Überprüfen, ob Validierungsfehler vorliegen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extrahiere Reservierungsdaten aus der Anfrage
    console.log('[PUT /api/reservations/:id] Request body:', req.body);
    const { date, time, customer_name, guest_count, employee_name, table_number, phone_number } = req.body;
    const { id } = req.params;

    try {
      // Reservierung in der Datenbank aktualisieren
      const updatedReservation = await pool.query(
        'UPDATE reservations SET date = $1, time = $2, customer_name = $3, guest_count = $4, employee_name = $5, table_number = $6, phone_number = $7 WHERE id = $8 RETURNING *',
        [date, time, customer_name, guest_count, employee_name, table_number, phone_number, id]
      );
      console.log('[PUT /api/reservations/:id] Updated reservation:', updatedReservation.rows[0]);

      res.json(updatedReservation.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Reservierung löschen
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Reservierung in der Datenbank löschen
    const deletedReservation = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING *', [id]);
    console.log('[DELETE /api/reservations/:id] Deleted reservation:', deletedReservation.rows[0]);

    res.json({ msg: 'Reservation deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

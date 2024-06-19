const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');

// Neue Reservierung erstellen
router.post('/',
  [
    auth,
    check('date').isDate().withMessage('Invalid date format'),
    check('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    check('customerName').not().isEmpty().withMessage('Customer name is required'),
    check('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
    check('employeeName').not().isEmpty().withMessage('Employee name is required'),
    check('tableNumber').optional().isInt().withMessage('Table number must be an integer'),
    check('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  async (req, res) => {
    // Fehler in der Eingabe validieren
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, time, customerName, guestCount, employeeName, tableNumber, phoneNumber } = req.body;
    try {
      // Neue Reservierung in der Datenbank speichern
      const newReservation = await pool.query(
        'INSERT INTO reservations (date, time, customer_name, guest_count, employee_name, table_number, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [date, time, customerName, guestCount, employeeName, tableNumber, phoneNumber]
      );
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
    res.json(reservations.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Reservierung aktualisieren
router.put('/:id',
  [
    auth,
    check('date').isDate().withMessage('Invalid date format'),
    check('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    check('customerName').not().isEmpty().withMessage('Customer name is required'),
    check('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
    check('employeeName').not().isEmpty().withMessage('Employee name is required'),
    check('tableNumber').optional().isInt().withMessage('Table number must be an integer'),
    check('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  async (req, res) => {
    // Fehler in der Eingabe validieren
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, time, customerName, guestCount, employeeName, tableNumber, phoneNumber } = req.body;
    const { id } = req.params;
    try {
      // Reservierung in der Datenbank aktualisieren
      const updateReservation = await pool.query(
        'UPDATE reservations SET date = $1, time = $2, customer_name = $3, guest_count = $4, employee_name = $5, table_number = $6, phone_number = $7 WHERE id = $8 RETURNING *',
        [date, time, customerName, guestCount, employeeName, tableNumber, phoneNumber, id]
      );

      if (updateReservation.rows.length === 0) {
        return res.status(404).json({ msg: 'Reservation not found' });
      }

      res.json(updateReservation.rows[0]);
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
    const deleteReservation = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING *', [id]);

    if (deleteReservation.rows.length === 0) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    res.json({ msg: 'Reservation removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

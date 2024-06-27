const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const moment = require('moment-timezone');

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
    //console.log('[POST /api/reservations] User ID from JWT:', req.user.id);

    // Extrahiere Reservierungsdaten aus der Anfrage
    console.log('[POST /api/reservations] Request body:', req.body);
    var { date, time, customer_name, guest_count, employee_name, table_number, phone_number } = req.body;

    // Datum und Uhrzeit aus dem Request-Body
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    // Neues Date-Objekt erstellen und die entsprechenden Werte setzen
    let parsedDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // ISO-String mit der aktualisierten Uhrzeit
    const updatedDate = parsedDate.toISOString();

    console.log(updatedDate); // "2024-06-27T12:00:00.000Z
    date = updatedDate;
    
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
      console.error("[POST /api/reservations] ERROR :",err.message);
      console.log("[POST /api/reservations] date : ", date);
      res.status(500).send('Server Error');
    }
  }
);



// Alle Reservierungen abrufen
router.get('/', auth, async (req, res) => {
  try {
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Alle Reservierungen abrufen
router.get('/all', auth, async (req, res) => {
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



// Alle Reservierungen für ein bestimmtes Datum abrufen
router.get('/dailyReservation', auth, async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ msg: 'Date is required' });
  }

  try {

    //console.log("[GET /dailyReservation] date :", date);

    // Das angegebene Datum in ein Moment-Objekt umwandeln
    const requestedDate1 = moment(date, 'DD/MM/YYYY').startOf('day');

    // Start des Tages festlegen und Uhrzeit auf 12:00 setzen
    const updatedDate = requestedDate1.set({ hour: 12 }).format('YYYY-MM-DD HH:mm:ss');

    //console.log("[GET /dailyReservation] updatedDate :", updatedDate); // "2024-07-02 12:00:00"
   
    // SQL-Abfrage für Reservierungen an einem bestimmten Datum
    const query = 'SELECT * FROM reservations where date = $1';
    
    // Abfrage ausführen
    const { rows } = await pool.query(query, [updatedDate]);
    //console.log("[GET /dailyReservation] rows :", rows);
    //console.log("---")
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err.message);
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

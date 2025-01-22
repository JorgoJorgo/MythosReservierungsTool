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

    // Extrahiere Reservierungsdaten aus der Anfrage
    console.log('[POST /api/reservations] Request body:', req.body);
    let { date, time, customer_name, guest_count, employee_name, table_number, phone_number, Note} = req.body;

    // Datum und Uhrzeit aus dem Request-Body
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    console.log('[POST /api/reservations] Day:', day);
    console.log('[POST /api/reservations] Month:', month);
    console.log('[POST /api/reservations] Year:', year);

    // Neues Date-Objekt erstellen (UTC)
    let parsedDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    console.log('[POST /api/reservations] ParsedDate (UTC):', parsedDate);

    // Speichere das Datum direkt in UTC
    const updatedDate = parsedDate.toISOString();

    console.log('[POST /api/reservations] UpdatedDate (UTC):', updatedDate);

    // Zeit im HH:MM:SS Format formatieren
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

    console.log("[POST /api/reservations] Note: ", Note);
    //console.log("[POST /api/reservations] note: ", note);
    try {
      // Füge die Reservierungsdaten in die Datenbank ein
      const newReservation = await pool.query(
        'INSERT INTO reservations (date, time, customer_name, guest_count, employee_name, table_number, phone_number, "Note", user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [updatedDate, formattedTime, customer_name, guest_count, employee_name, table_number, phone_number, Note, req.user.id]
      );
      
      console.log('[POST /api/reservations] New reservation:', newReservation.rows[0]);

      // Sende eine Bestätigung der erfolgreichen Reservierung zurück
      res.json(newReservation.rows[0]);
    } catch (err) {
      console.error("[POST /api/reservations] ERROR:", err.message);
      console.log("[POST /api/reservations] Date to insert:", updatedDate);
      res.status(500).send('Server Error');
    }


  }
);


//Route zum markieren einer Reservierung
router.post(
  '/markReservation',
  [
    auth,
    check('reservation_id', 'Reservation ID is required and should be an integer').isInt()
  ],
  async (req, res) => {
    console.log('[/markReservation] Request received at /markReservation:', req.body);
    // Validierungsfehler prüfen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Reservation-ID aus der Anfrage extrahieren
    const { reservation_id } = req.body;

    try {
      // Abfrage zur Aktualisierung des Flags `marked`
      const result = await pool.query(
        `
        UPDATE reservations
        SET "Marked" = NOT "Marked"
        WHERE id = $1
        RETURNING *
        `,
        [reservation_id]
      );

      // Überprüfen, ob eine Reservierung aktualisiert wurde
      if (result.rowCount === 0) {
        return res.status(404).json({ msg: 'Reservation not found' });
      }

      // Rückgabe der aktualisierten Reservierung
      console.log(`[POST /markReservation] Updated reservation:`, result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error(`[POST /markReservation] ERROR:`, err.message);
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
    console.log("[GET /dailyReservation] date :", date);

    // Datum konvertieren
    const requestedDate = moment(date, 'DD/MM/YYYY').startOf('day');

    // Start- und Endzeit des Tages in UTC berechnen
    const startOfDayUTC = requestedDate.clone().utc().format();
    const endOfDayUTC = requestedDate.clone().utc().add(1, 'day').format();

    console.log("[GET /dailyReservation] startOfDayUTC :", startOfDayUTC);
    console.log("[GET /dailyReservation] endOfDayUTC :", endOfDayUTC);

    // SQL-Abfrage für Reservierungen zwischen Start und Ende des Tages
    const query = `
      SELECT * FROM reservations
      WHERE date >= $1 AND date < $2
    `;

    // Abfrage ausführen
    const { rows } = await pool.query(query, [startOfDayUTC, endOfDayUTC]);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).send('Server Error');
  }
});

// Alle Reservierungen für ein bestimmtes Datum abrufen
router.get('/dailyNote', auth, async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ msg: 'Date is required' });
  }

  try {
    console.log("[GET /dailyNote] date :", date);

    // Datum konvertieren
    const requestedDate = moment(date, 'DD/MM/YYYY').startOf('day');

    // Start- und Endzeit des Tages in UTC berechnen
    const startOfDayUTC = requestedDate.clone().utc().format();
    const endOfDayUTC = requestedDate.clone().utc().add(1, 'day').format();

    //console.log("[GET /dailyReservation] startOfDayUTC :", startOfDayUTC);
    //console.log("[GET /dailyReservation] endOfDayUTC :", endOfDayUTC);

    // SQL-Abfrage für Reservierungen zwischen Start und Ende des Tages
    const query = `
      SELECT * FROM daily_note
      WHERE date >= $1 AND date < $2
    `;

    // Abfrage ausführen
    const { rows } = await pool.query(query, [startOfDayUTC, endOfDayUTC]);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).send('Server Error');
  }
});

// Route zum Erstellen von Tagesnotizen
router.post(
  '/dailyNote',
  [
    auth,
    check('date', 'Date is required').notEmpty(),
    check('daily_note', 'Note is required').notEmpty()
  ],
  async (req, res) => {
    // Überprüfen, ob Validierungsfehler vorliegen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extrahiere Notizdaten aus der Anfrage
    console.log('[POST /api/dailyNote] Request body:', req.body);
    let { date, daily_note } = req.body;

    // Dummy-Zeit hinzufügen, um die Konsistenz mit der anderen Route zu gewährleisten
    const time = '00:00';

    // Datum und Uhrzeit aus dem Request-Body
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    console.log('[POST /api/dailyNote] Day:', day);
    console.log('[POST /api/dailyNote] Month:', month);
    console.log('[POST /api/dailyNote] Year:', year);

    // Neues Date-Objekt erstellen (UTC)
    let parsedDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    console.log('[POST /api/dailyNote] ParsedDate (UTC):', parsedDate);

    // Speichere das Datum direkt in UTC
    const updatedDate = parsedDate.toISOString();

    console.log('[POST /api/dailyNote] UpdatedDate (UTC):', updatedDate);

    try {
      // Füge die Tagesnotizdaten in die Datenbank ein
      const newDailyNote = await pool.query(
        'INSERT INTO daily_note (date, daily_note) VALUES ($1, $2) RETURNING *',
        [updatedDate,daily_note]
      );

      console.log('[POST /api/dailyNote] New daily note:', newDailyNote.rows[0]);

      // Sende eine Bestätigung der erfolgreichen Erstellung zurück
      res.json(newDailyNote.rows[0]);
    } catch (err) {
      console.error("[POST /api/dailyNote] ERROR:", err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Route zum Erstellen oder Aktualisieren von Tagesnotizen
router.put(
  '/dailyNote',auth,async (req, res) => {

    // Extrahiere Notizdaten aus der Anfrage
    console.log('[PUT /api/dailyNote] Request body:', req.body);
    let { date, daily_note } = req.body;

    // Dummy-Zeit hinzufügen, um die Konsistenz mit der anderen Route zu gewährleisten
    const time = '00:00';

    // Datum und Uhrzeit aus dem Request-Body
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    console.log('[PUT /api/dailyNote] Day:', day);
    console.log('[PUT /api/dailyNote] Month:', month);
    console.log('[PUT /api/dailyNote] Year:', year);

    // Neues Date-Objekt erstellen (UTC)
    let parsedDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    console.log('[PUT /api/dailyNote] ParsedDate (UTC):', parsedDate);

    // Speichere das Datum direkt in UTC
    const updatedDate = parsedDate.toISOString();

    console.log('[PUT /api/dailyNote] UpdatedDate (UTC):', updatedDate);

    try {
      // Überprüfen, ob eine Notiz für das Datum existiert
      const existingNote = await pool.query(
        'SELECT * FROM daily_note WHERE date = $1',
        [updatedDate]
      );

      if (existingNote.rows.length > 0) {
        // Aktualisiere die bestehende Notiz
        const updatedNote = await pool.query(
          'UPDATE daily_note SET daily_note = $1 WHERE date = $2 RETURNING *',
          [daily_note, updatedDate]
        );

        console.log('[PUT /api/dailyNote] Updated daily note:', updatedNote.rows[0]);
        return res.json(updatedNote.rows[0]);
      } else {
        // Erstelle eine neue Notiz, falls keine existiert
        const newDailyNote = await pool.query(
          'INSERT INTO daily_note (date, daily_note) VALUES ($1, $2) RETURNING *',
          [updatedDate, daily_note]
        );

        console.log('[PUT /api/dailyNote] New daily note:', newDailyNote.rows[0]);
        return res.json(newDailyNote.rows[0]);
      }
    } catch (err) {
      console.error("[PUT /api/dailyNote] ERROR:", err.message);
      res.status(500).send('Server Error');
    }
  }
);



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
    const { date, time, customer_name, guest_count, employee_name, table_number, phone_number, Note } = req.body;
    const { id } = req.params;

    try {
      // Reservierung in der Datenbank aktualisieren
      const updatedReservation = await pool.query(
        'UPDATE reservations SET date = $1, time = $2, customer_name = $3, guest_count = $4, employee_name = $5, table_number = $6, phone_number = $7, "Note" = $8 WHERE id = $9 RETURNING *',
        [date, time, customer_name, guest_count, employee_name, table_number, phone_number,Note, id]
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

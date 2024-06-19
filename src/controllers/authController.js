const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const pool = require('../db');

// Route zur Benutzerregistrierung
router.post('/register',
  [
    // Eingabevalidierung
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    // Fehler in der Eingabe validieren
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      // Passwort hashen
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Benutzer in der Datenbank speichern
      const newUser = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [username, hashedPassword]
      );

      // JWT erstellen
      const payload = {
        user: {
          id: newUser.rows[0].id
        }
      };
      const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });

      // Token zurückgeben
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Route zum Benutzerlogin
router.post('/login',
  [
    // Eingabevalidierung
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').not().isEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // Fehler in der Eingabe validieren
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      // Benutzer in der Datenbank suchen
      console.log('Anfrage an die Datenbank:', username);
      

        
      const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      console.log('Datenbankantwort:', user.rows);
      if (user.rows.length === 0) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Passwort überprüfen
      console.log('Eingegebenes Passwort:', password);
      console.log('Gehashtes Passwort in der Datenbank:', user.rows[0].password);
      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // JWT erstellen
      const payload = {
        user: {
          id: user.rows[0].id
        }
      };
      const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });

      // Token zurückgeben
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  
);

module.exports = router;

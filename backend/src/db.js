const { Pool } = require('pg');
require('dotenv').config();

//einloggen am laptop
const poolLaptop = new Pool({
  user: process.env.db_user,          // Dein Benutzername
  host: '127.0.0.1',
  database: 'reservations_db',
  password: process.env.db_password,  // Dein Passwort
  port: process.env.db_port,
});

//hier muss das jeweilige auskommentiert werden
// module.exports = pool;
module.exports = poolLaptop;
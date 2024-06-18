const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'reservations_db',
  password: 'testing187',
  port: 5432,
});

module.exports = pool;
# MythosReservierungsTool

## Server starten: 
```
node src/app.js
```

## Datenbank:
DB über pgAdmin (PostgreSQL):
PostgreSQL/reservations_db (rechtsclick Query Tool) Schema : 
```
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  guest_count INTEGER NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  table_number INTEGER,
  phone_number VARCHAR(15)
);
```

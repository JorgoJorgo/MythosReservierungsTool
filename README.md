# MythosReservierungsTool

## Server starten: 
```
node src/app.js
```

## Datenbank:
DB über pgAdmin (PostgreSQL):
### PostgreSQL/reservations_db (rechtsclick Query Tool) Schema : 
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

### Datenbank testen:
(https://web.postman.co/workspace/My-Workspace~a5d918e1-f044-4551-8821-4d7402ac829c/request/create?requestId=e00038a4-ef15-4004-b3c6-a2f6a746c26e)

- Anzeigen lassen
```
GET http://localhost:3000/api/reservations
```
- Neu einfügen
```
POST http://localhost:3000/api/reservations
```
mit (raw) Body:
```
{
  "date": "2024-07-01",
  "time": "19:00",
  "customerName": "Max Mustermann",
  "guestCount": 4,
  "employeeName": "John Doe",
  "tableNumber": 12,
  "phoneNumber": "0123456789"
}
```
### User anlegen:
Passwort hashen mit 
```
./src/hashPassword.js
```

```
INSERT INTO users (username, password) VALUES ('jorgo', 'Ausgabe von vorher');
```

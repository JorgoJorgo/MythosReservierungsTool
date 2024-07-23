# MythosReservierungsTool

## Server starten: 
```
cd .../backend npm start
```

## Frontend starten:
```
cd .../reservations-frontend npm start
```

## Datenbank:
DB über pgAdmin (PostgreSQL):
### PostgreSQL/reservations_db (rechtsclick Query Tool) Schema : 
```
CREATE TABLE IF NOT EXISTS public.reservations
(
    id integer NOT NULL DEFAULT nextval('reservations_id_seq'::regclass),
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    customer_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    guest_count integer NOT NULL,
    employee_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    table_number integer,
    phone_number character varying(15) COLLATE pg_catalog."default",
    user_id integer,
    CONSTRAINT reservations_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username)
)
``` 
### Datenbank testen:
(https://web.postman.co/workspace/My-Workspace~a5d918e1-f044-4551-8821-4d7402ac829c/request/create?requestId=e00038a4-ef15-4004-b3c6-a2f6a746c26e)

## Routen (gehen alle nur mit x-auth-token im Header): 

#### Login: 
```
POST http://localhost:5000/api/auth/login
```
JSON Body :
```{"username": "jorgo", "password": "your_password"}```

## Returnt den x-auth-token der in die nächsten Anfragen rein muss

#### Alle Reservierungen der DB anschauen:
```
GET http://localhost:5000/api/reservations/all
```
Returnt JSON: 
```
[
    {
        "id": 65,
        "date": "2024-07-01T10:00:00.000Z",
        "time": "12:00:00",
        "customer_name": "Max Mustermann",
        "guest_count": 4,
        "employee_name": "Anna Mitarbeiter",
        "table_number": 5,
        "phone_number": "123456789",
        "user_id": 1
    }, 
    ...
]
```
#### Einzelnen Tag anschauen:
```
GET http://localhost:5000/api/reservations/dailyReservation?date=03/07/2024
```
Returnt JSON:
```
[
    {
        "id": 67,
        "date": "2024-07-03T10:00:00.000Z",
        "time": "12:00:00",
        "customer_name": "Max Mustermann",
        "guest_count": 4,
        "employee_name": "Anna Mitarbeiter",
        "table_number": 5,
        "phone_number": "123456789",
        "user_id": 1
    },
    ...
]
```

#### neue Reservierung speichern:
```
POST http://localhost:5000/api/reservations
```
Mit Body : 
```
{
 "date": "10/07/2024",
  "time": "12:00",
  "customer_name": "Max Mustermann",
  "guest_count": "4",
  "employee_name": "Anna Mitarbeiter",
  "table_number": "5",
  "phone_number": "123456789"
}
```
Returnt JSON wie es in der DB gespeichert wird: 
```
{
    "id": 85,
    "date": "2024-07-10T10:00:00.000Z",
    "time": "12:00:00",
    "customer_name": "Max Mustermann",
    "guest_count": 4,
    "employee_name": "Anna Mitarbeiter",
    "table_number": 5,
    "phone_number": "123456789",
    "user_id": 1
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
Dann den Server starten
```
./src/app.js
```
Dann einen User registrieren: 
```
POST http://localhost:5000/api/auth/register
``` 
Mit dem Body (raw JSON)
```
{"username": "jorgo", "password": "your_password"}
```
Dann einloggen (mit dem selben Body)
```
POST http://localhost:5000/api/auth/login
```

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';
import LoginForm from './components/Login'; // Annahme: Komponente für das Login-Formular
import './App.css';

function App() {
  const [date, setDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false); // Zustand für den eingeloggten Zustand
  const [user, setUser] = useState(null); // Zustand für Benutzerdaten

  // Funktion zum Einloggen
  const handleLogin = (userData) => {
    // Hier normalerweise eine API-Anfrage zum Einloggen
    // Nach erfolgreichem Einloggen Token im localStorage speichern
    localStorage.setItem('token', userData.token);
    setUser(userData.user); // Speichert Benutzerdaten im Zustand
    setLoggedIn(true); // Benutzer als eingeloggt markieren
  };

  // Funktion zum Ausloggen
  const handleLogout = () => {
    localStorage.removeItem('token'); // Token aus localStorage entfernen
    setUser(null); // Benutzerdaten im Zustand zurücksetzen
    setLoggedIn(false); // Benutzer als ausgeloggt markieren
  };

  const fetchReservations = async (selectedDate) => {
    try {
      const formattedDate = formatDate(selectedDate); // Funktion, die das Datum formatiert
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reservations?date=${formattedDate}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations(date);
  }, [date]);

  const formatDate = (date) => {
    const d = new Date(date);
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return formattedDate;
  };

  return (
    <div className="App">
      <h1>Reservierungssystem</h1>
      {loggedIn ? (
        <>
          <div className="calendar-container">
            <Calendar onChange={setDate} value={date} />
          </div>
          <div className="reservations-list">
            <ReservationList selectedDate={date} />
          </div>
          <div className="reservation-form">
            <ReservationForm selectedDate={date} />
          </div>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

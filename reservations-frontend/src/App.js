import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';
import LoginForm from './components/Login'; // Annahme: Komponente für das Login-Formular
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [date, setDate] = useState(new Date());
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


  const formatDate = (date) => {
    const d = new Date(date);
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return formattedDate;
  };

  return (
    <div className="App">
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
        <LoginForm className="center" onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

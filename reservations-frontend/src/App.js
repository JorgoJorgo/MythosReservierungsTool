import React from 'react';
import ReservationForm from './components/ReservationForm';
import Login from './components/Login'; // Hier importieren Sie die Login-Komponente
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mythos Reservierungstool</h1>
      </header>
      <main>
        <Login /> {/* Hier rendern Sie die Login-Komponente */}
        {/* <ReservationForm /> */}
      </main>
    </div>
  );
}

export default App;

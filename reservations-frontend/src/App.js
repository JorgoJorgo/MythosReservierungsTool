import React from 'react';
import ReservationForm from './components/ReservationForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mythos Reservierungstool</h1>
      </header>
      <main>
        <ReservationForm />
      </main>
    </div>
  );
}

export default App;

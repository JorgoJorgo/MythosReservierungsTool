import React, { useState } from 'react';
import ReservationForm from './components/ReservationForm';
import Login from './components/Login';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mythos Reservierungstool</h1>
      </header>
      <main>
        {isLoggedIn ? <ReservationForm /> : <Login onLoginSuccess={handleLoginSuccess} />}
      </main>
    </div>
  );
}

export default App;

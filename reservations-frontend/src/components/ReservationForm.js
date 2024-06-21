import React, { useState } from 'react';
import './ReservationForm.css';

function ReservationForm({ selectedDate }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return formattedDate;
  };

  const [reservationData, setReservationData] = useState({
    date: formatDate(selectedDate), // Datum im Format 'DD/MM/YYYY'
    time: '12:00', // Beispielzeit
    customer_name: 'Max Mustermann', // Beispielname
    guest_count: '4', // Beispielanzahl Gäste
    employee_name: 'Anna Mitarbeiter', // Beispielname des Mitarbeiters
    table_number: '5', // Beispiel Tischnummer
    phone_number: '123456789' // Beispiel Telefonnummer
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(reservationData)
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    setReservationData({ ...reservationData, [e.target.name]: e.target.value });
  };

  return (
    <div className="reservation-form">
      <h2>Reservierung erstellen für {formatDate(selectedDate)}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="time">Uhrzeit:</label>
        <input
          type="time"
          id="time"
          name="time"
          value={reservationData.time}
          onChange={handleChange}
        />
        <label htmlFor="customer_name">Kundenname:</label>
        <input
          type="text"
          id="customer_name"
          name="customer_name"
          value={reservationData.customer_name}
          onChange={handleChange}
        />
        <label htmlFor="guest_count">Anzahl der Gäste:</label>
        <input
          type="number"
          id="guest_count"
          name="guest_count"
          value={reservationData.guest_count}
          onChange={handleChange}
        />
        <label htmlFor="employee_name">Mitarbeitername:</label>
        <input
          type="text"
          id="employee_name"
          name="employee_name"
          value={reservationData.employee_name}
          onChange={handleChange}
        />
        <label htmlFor="table_number">Tischnummer:</label>
        <input
          type="text"
          id="table_number"
          name="table_number"
          value={reservationData.table_number}
          onChange={handleChange}
        />
        <label htmlFor="phone_number">Telefonnummer:</label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={reservationData.phone_number}
          onChange={handleChange}
        />
        <input type="submit" value="Reservieren" />
      </form>
    </div>
  );
}

export default ReservationForm;

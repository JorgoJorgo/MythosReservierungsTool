import React, { useState, useEffect } from 'react';

const ReservationList = ({ selectedDate }) => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  const fetchReservations = async (date) => {
    try {
      const formattedDate = formatDate(date); // Funktion, die das Datum formatiert
      const response = await fetch(`http://localhost:5000/api/reservations?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const sortedReservations = data.sort((a, b) => a.time.localeCompare(b.time));
      setReservations(sortedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return formattedDate;
  };

  return (
    <div className="reservation-list">
      <h2>Reservierungen für {formatDate(selectedDate)}</h2>
      <ul>
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <li key={reservation.id}>
              <p>Zeit: {reservation.time}, Kunde: {reservation.customer_name}</p>
              <p>Mitarbeiter: {reservation.employee_name}, Gäste: {reservation.guest_count}</p>
              <p>Tisch: {reservation.table_number}, Telefon: {reservation.phone_number}</p>
            </li>
          ))
        ) : (
          <p>Keine Reservierungen für dieses Datum.</p>
        )}
      </ul>
    </div>
  );
};

export default ReservationList;

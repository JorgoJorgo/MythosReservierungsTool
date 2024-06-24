import React, { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';

const ReservationList = ({ selectedDate }) => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  const fetchReservations = async (selectedDate) => {
    try {
      const formattedDate = formatDate(selectedDate); // Funktion, die das Datum formatiert
      console.log("[ReservationList fetchReservations] selectedDate :", selectedDate)
      console.log("[ReservationList fetchReservations] formattedDate :", formattedDate)
      const token = localStorage.getItem('token');
      const response2 = await fetch(`http://localhost:5000/api/reservations?date=${selectedDate}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      console.log("[ReservationList fetchReservations] response2 : ", response2)
      const response = await fetch(`http://localhost:5000/api/reservations?date=${formattedDate}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      console.log("[ReservationList fetchReservations] response : ", response)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReservations(data);
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
        <Accordion>
        {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <Accordion.Item eventKey={reservation.id} id={reservation.id} key={reservation.id}>
                  <Accordion.Header>Zeit: {reservation.time}, Kunde: {reservation.customer_name}, Personen: {reservation.guest_count} </Accordion.Header>
                  <Accordion.Body>
                  <p>Zeit: {reservation.time} </p> 
                  <p>Kunde: {reservation.customer_name}</p>
                  <p> Gäste: {reservation.guest_count}</p>
                  <p>Tisch: {reservation.table_number}</p> 
                  <p>Telefon: {reservation.phone_number}</p>
                  <p>Mitarbeiter: {reservation.employee_name}</p> 
                  <p>Reservation ID: {reservation.id}</p>
                  </Accordion.Body>
                </Accordion.Item>
              ))
            ) : (
              <p>Keine Reservierungen für dieses Datum.</p>
            )}
        </Accordion>
          {/* <ul>
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
          </ul> */}
    </div>
  );
};

export default ReservationList;

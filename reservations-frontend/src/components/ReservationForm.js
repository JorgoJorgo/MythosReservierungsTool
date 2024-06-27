import React, { useState } from 'react';
import './ReservationForm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function ReservationForm({ selectedDate }) {
  const formatDate = (date) => {
    console.log("[ReservationForm formatDate]: date = ", date)
    console.log("[ReservationForm formatDate]: selectedDate = ", selectedDate)
    const d = new Date(date);
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    console.log("[ReservationForm formatDate]: formattedDate = ", formattedDate)
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
    <div className="form-container">
  <div className="form-wrapper">
    <Form onSubmit={handleSubmit} className="reservation-form">
      
      <div className="form-fields">
        <Form.Group className="mb-3">
          <Form.Label>Uhrzeit</Form.Label>
          <Form.Control type="time" id="time" name="time" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Kundenname</Form.Label>
          <Form.Control type="text"
            id="customer_name"
            name="customer_name"
            value={reservationData.customer_name}
            onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Anzahl der Gäste</Form.Label>
          <Form.Control type="number"
            id="guest_count"
            name="guest_count"
            value={reservationData.guest_count}
            onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Mitarbeitername</Form.Label>
          <Form.Control type="text"
            id="employee_name"
            name="employee_name"
            value={reservationData.employee_name}
            onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tischnummer</Form.Label>
          <Form.Control type="text"
            id="table_number"
            name="table_number"
            value={reservationData.table_number}
            onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Telefonnummer</Form.Label>
          <Form.Control type="tel"
            id="phone_number"
            name="phone_number"
            value={reservationData.phone_number}
            onChange={handleChange} />
        </Form.Group> 
      </div>
      
      <div className="button-container">
        <Button variant="primary" type="submit">
          Speichern
        </Button>
      </div>
    </Form>
  </div>
</div>



  );
}

export default ReservationForm;

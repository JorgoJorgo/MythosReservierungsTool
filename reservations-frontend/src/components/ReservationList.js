import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ReservationList.css';
import { settings } from "../settings";

const ReservationList = ({ selectedDate }) => {
  const [reservations, setReservations] = useState([]);
  const [markedReservations, setMarkedReservations] = useState([]);
  const [editReservationId, setEditReservationId] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  const fetchReservations = async (selectedDate) => {
    try {
      const formattedDate = formatDate(selectedDate);
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${settings.server_url}api/reservations/dailyReservation?date=${formattedDate}`,
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Reservierungen.');
      }

      const data = await response.json();

      const unmarked = data.filter((res) => !res.Marked);
      const marked = data.filter((res) => res.Marked);

      setReservations(unmarked);
      setMarkedReservations(marked);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleToggleMarkClick = async (reservation) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${settings.server_url}api/reservations/markReservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ reservation_id: reservation.id }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler: ${errorText}`);
      }
  
      const updatedReservation = await response.json();
  
      if (updatedReservation.Marked) {
        setMarkedReservations((prev) =>
          [...prev, updatedReservation].sort((a, b) => a.time.localeCompare(b.time))
        );
        setReservations((prev) =>
          prev.filter((res) => res.id !== updatedReservation.id)
        );
      } else {
        setReservations((prev) =>
          [...prev, updatedReservation].sort((a, b) => a.time.localeCompare(b.time))
        );
        setMarkedReservations((prev) =>
          prev.filter((res) => res.id !== updatedReservation.id)
        );
      }
    } catch (error) {
      console.error('Error toggling mark on reservation:', error);
    }
  };

  const handleEditClick = (reservation) => {
    setEditReservationId(reservation.id); 
    setEditedData({ ...reservation }); 
  };

  const handleSaveClick = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${settings.server_url}api/reservations/${editReservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Änderungen.');
      }

      alert('Reservierung erfolgreich aktualisiert!');
      setEditReservationId(null);
      fetchReservations(selectedDate);
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const handleDeleteClick = async (reservationId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${settings.server_url}api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen der Reservierung.');
      }

      alert('Reservierung erfolgreich gelöscht!');
      fetchReservations(selectedDate);
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({ ...prevData, [name]: value }));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatDateForUI = (date) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  return (
    <div className="reservation-list">
      <hr />
      <h2>Reservierungen für {formatDateForUI(selectedDate)}</h2>
      <Accordion>
        {reservations.map((reservation) => (
          <Accordion.Item
            eventKey={`unmarked-${reservation.id}`}
            key={`unmarked-${reservation.id}`}
            id={`unmarked-${reservation.id}`}
          >
            <Accordion.Header>
              <h5>
                <span style={{ display: "inline-block", width: "200px", border: "1px solid black", padding: "5px", margin: "0" }}>{reservation.time.slice(0, 5)} - {reservation.Note}</span>
                <span style={{ display: "inline-block", width: "200px", border: "1px solid black", padding: "5px", margin: "0" }}>{reservation.customer_name}</span>
                <span style={{ display: "inline-block", width: "60px", border: "1px solid black", padding: "5px", margin: "0" }}>{reservation.guest_count} P</span>
                <span style={{ display: "inline-block", width: "80px", border: "1px solid black", padding: "5px", margin: "0" }}>({reservation.table_number})</span>
              </h5>
            </Accordion.Header>
            <Accordion.Body>
              {editReservationId === reservation.id ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Uhrzeit</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={editedData.time}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kunde</Form.Label>
                    <Form.Control
                      type="text"
                      name="customer_name"
                      value={editedData.customer_name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Anzahl der Gäste</Form.Label>
                    <Form.Control
                      type="number"
                      name="guest_count"
                      value={editedData.guest_count}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Tischnummer</Form.Label>
                    <Form.Control
                      type="text"
                      name="table_number"
                      value={editedData.table_number}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefonnummer</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone_number"
                      value={editedData.phone_number}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Notiz</Form.Label>
                    <Form.Control
                      type="text"
                      name="Note"
                      value={editedData.Note}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Button variant="success" onClick={handleSaveClick}>
                    Speichern
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditReservationId(null)}
                  >
                    Abbrechen
                  </Button>
                </>
              ) : (
                <>
                  <p>Zeit: {reservation.time.slice(0, 5)}</p>
                  <p>Kunde: {reservation.customer_name}</p>
                  <p>Gäste: {reservation.guest_count}</p>
                  <p>Tisch: {reservation.table_number}</p>
                  <p>Telefon: {reservation.phone_number}</p>
                  <p>Mitarbeiter: {reservation.employee_name}</p>
                  <p>Notiz: {reservation.Note}</p>
                  <p>Reservation ID: {reservation.id}</p>
                  <div className="button-container">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleMarkClick(reservation)}
                    >
                      Markieren
                    </Button>
                    
                    <Button
                      variant="warning"
                      onClick={() => handleEditClick(reservation)}
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(reservation.id)}
                    >
                      Löschen
                    </Button>
                  </div>
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      <hr />
      <h2>Markierte Reservierungen</h2>
      <Card>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {markedReservations.map((reservation) => (
          <li key={`marked-${reservation.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} id={`marked-${reservation.id}`}>
            <span style={{ fontSize: '16px', fontWeight: '500', textDecoration: 'line-through' }}>{reservation.time.slice(0, 5)} - {reservation.customer_name} - {reservation.guest_count} P - ({reservation.table_number}) - {reservation.Note}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleToggleMarkClick(reservation)}
            >
              Demarkieren
            </Button>
          </li>
        ))}
      </ul>
      </Card>
      
    </div>
  );
};

export default ReservationList;

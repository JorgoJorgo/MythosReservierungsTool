import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './DailyNote.css';
import { settings } from '../settings';

const DailyNote = ({ selectedDate }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (selectedDate) {
      fetchDailyNote(selectedDate);
    }
  }, [selectedDate]);

  const fetchDailyNote = async (date) => {
    try {
      const formattedDate = formatDate(date);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${settings.server_url}api/reservations/dailyNote?date=${formattedDate}`, {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched daily note:', data);
  
        // Stelle sicher, dass die Notiz gesetzt wird, wenn sie existiert
        if (data.length > 0) {
          setNote(data[0].daily_note || ''); // Greife auf das erste Element im Array zu
        } else {
          setNote(''); // Falls keine Notiz existiert, setze leeren Text
        }
      } else {
        console.error('Failed to fetch daily note:', response.statusText);
        setNote('');
      }
    } catch (error) {
      console.error('Error fetching daily note:', error);
      setNote('');
    }
  };
  

  const handleSaveClick = async () => {
    try {
      const formattedDate = formatDate(selectedDate);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${settings.server_url}api/reservations/dailyNote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ date: formattedDate, daily_note: note }),
      });

      if (response.ok) {
        alert('Notiz erfolgreich gespeichert!');
      } else {
        console.error('Failed to save daily note:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving daily note:', error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="daily-note" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Frei bis {formatDate(selectedDate)}</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label></Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSaveClick}>
          Speichern
        </Button>
      </Form>
    </div>
  );
};

export default DailyNote;

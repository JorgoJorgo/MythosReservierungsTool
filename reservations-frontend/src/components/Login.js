import React, { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(" ");
  const { username, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        console.log("BIN AUF FEHLER GESTOßEN1")
        setError(true)
        setErrorMessage(data.msg); // Fehlermeldung setzen, falls vorhanden
      } else {
        setError(false)
        setErrorMessage(''); // Fehlermeldung löschen, falls keine vorhanden
        console.log(data); // Hier können Sie die Serverantwort verarbeiten
      }
    } catch (error) {
      console.error('Error:', error);
      console.log("BIN AUF FEHLER GESTOßEN3")
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{"Fehler beim Login, bitte überprüfe deinen Benutzernamen & Passwort"}</p>} {/* Fehlermeldung wird hier gerendert */}
      {error && console.log("Fehler beim Login")}
      <form onSubmit={onSubmit}>
        <div>
          <input
            type='text'
            placeholder='Username'
            name='username'
            value={username}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={onChange}
            minLength='6'
            required
          />
        </div>
        <input type='submit' value='Login' />
      </form>
    </div>
  );
};

export default Login;

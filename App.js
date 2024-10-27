// App.js
import React, { useState } from 'react';
import StudentForm from './StudentForm';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  return (
    <div className="App">
      <StudentForm setMessage={setMessage} />
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;

// StudentForm.js
import React, { useState, useEffect } from 'react';
import './StudentForm.css';

function StudentForm({ setMessage }) {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState({
    name: '', email: '', dob: '', math: '', physics: '', chemistry: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  // Fetch students from backend
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/students');
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error fetching students');
    }
  };

  // Create or update student
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing 
      ? `http://localhost:5000/students/${editId}`
      : 'http://localhost:5000/students';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(isEditing ? 'Student updated successfully' : 'Student added successfully');
        fetchStudents();
        setStudent({ name: '', email: '', dob: '', math: '', physics: '', chemistry: '' });
        setIsEditing(false);
        setEditId(null);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error submitting the form');
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/students/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage('Student deleted successfully');
        fetchStudents();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error deleting student');
    }
  };

  // Edit student
  const handleEdit = (student) => {
    setStudent(student);
    setIsEditing(true);
    setEditId(student.id);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="student-form-container">
      <h1>Student Information Form</h1>
      <form className="student-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={student.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={student.email} onChange={handleChange} required />
        <input type="date" name="dob" placeholder="Date of Birth" value={student.dob} onChange={handleChange} required />
        <input type="number" name="math" placeholder="Mathematics Marks" value={student.math} onChange={handleChange} min="0" max="100" required />
        <input type="number" name="physics" placeholder="Physics Marks" value={student.physics} onChange={handleChange} min="0" max="100" required />
        <input type="number" name="chemistry" placeholder="Chemistry Marks" value={student.chemistry} onChange={handleChange} min="0" max="100" required />
        <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
      </form>

      <h2>Student List</h2>
      <ul>
        {students.map((stud) => (
          <li key={stud.id}>
            {stud.name} - {stud.email}
            <button onClick={() => handleEdit(stud)}>Edit</button>
            <button onClick={() => handleDelete(stud.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentForm;

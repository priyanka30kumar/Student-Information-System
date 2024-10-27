const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/student', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  marks: {
    math: { type: Number, required: true },
    physics: { type: Number, required: true },
    chemistry: { type: Number, required: true }
  },
  cutoff: Number
});

const Student = mongoose.model('Student', studentSchema);

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'priyanka30kumar@gmail.com',
    pass: 'snkzaigltmlvrnzb'
  }
});

// Create - Add New Student
app.post('/students', async (req, res) => {
  const { name, email, dob, math, physics, chemistry } = req.body;

  if (!name || !email || !dob || math == null || physics == null || chemistry == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Calculate cutoff marks (average)
  const cutoff = (math + physics + chemistry) / 3;

  const student = new Student({
    name,
    email,
    dob,
    marks: { math, physics, chemistry },
    cutoff
  });

  try {
    await student.save();

    const mailOptions = {
      from: 'priyanka30kumar@gmail.com',
      to: email,
      subject: 'Cutoff Marks',
      text: `Hello ${name}, your cutoff marks are: ${cutoff.toFixed(2)}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Student saved and email sent', cutoff });

  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Read - Get All Students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Read - Get Single Student by ID
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update - Edit Student by ID
app.put('/students/:id', async (req, res) => {
  const { name, email, dob, math, physics, chemistry } = req.body;

  if (!name || !email || !dob || math == null || physics == null || chemistry == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const cutoff = (math + physics + chemistry) / 3;

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, dob, marks: { math, physics, chemistry }, cutoff },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.status(200).json({ message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete - Remove Student by ID
app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.status(200).json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

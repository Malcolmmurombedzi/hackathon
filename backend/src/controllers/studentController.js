const { pool } = require('../config/database');
const generateStudentId = require('../utils/generateStudentId');

// Enroll a new student
const enrollStudent = async (req, res) => {
  try {
    const { full_name, date_of_birth, home_address, form } = req.body;

    // Validate required fields
    if (!full_name || !date_of_birth || !home_address || !form) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate unique student ID
    let student_id;
    let isUnique = false;
    
    while (!isUnique) {
      student_id = generateStudentId();
      const [existing] = await pool.execute(
        'SELECT student_id FROM students WHERE student_id = ?',
        [student_id]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Insert student
    await pool.execute(
      'INSERT INTO students (student_id, full_name, date_of_birth, home_address, form) VALUES (?, ?, ?, ?, ?)',
      [student_id, full_name, date_of_birth, home_address, form]
    );

    res.status(201).json({
      message: 'Student enrolled successfully',
      student: {
        student_id,
        full_name,
        date_of_birth,
        home_address,
        form
      }
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT * FROM students ORDER BY created_at DESC');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// Student login
const studentLogin = async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const [students] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(401).json({ error: 'Invalid student ID' });
    }

    res.json({
      message: 'Login successful',
      student: students[0]
    });
  } catch (error) {
    console.error('Error during student login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = {
  enrollStudent,
  getAllStudents,
  getStudentById,
  studentLogin
};

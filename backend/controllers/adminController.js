const { pool } = require('../config/db');
const generateStudentId = require('../utils/generateStudentId');

// Enroll a new student
async function enrollStudent(req, res) {
  try {
    const { full_name, date_of_birth, home_address, form } = req.body;

    if (!full_name || !date_of_birth || !home_address || !form) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate unique student ID
    const student_id = generateStudentId();

    // Insert student into database
    await pool.query(
      'INSERT INTO students (student_id, full_name, date_of_birth, home_address, form) VALUES (?, ?, ?, ?, ?)',
      [student_id, full_name, date_of_birth, home_address, form]
    );

    res.status(201).json({
      message: 'Student enrolled successfully',
      student_id,
      full_name,
      form
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
}

// Get financial records for a student
async function getFinancialRecords(req, res) {
  try {
    const { student_id } = req.params;

    // Check if student exists
    const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all fee payments
    const [payments] = await pool.query(
      'SELECT * FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC',
      [student_id]
    );

    // Calculate total fees paid
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    // Assuming standard fee is 1000 per term and there are 3 terms per year
    const standardFeePerTerm = 1000;
    
    // Get unique terms paid for
    const termsPaid = [...new Set(payments.map(p => p.term))];

    res.json({
      student: students[0],
      payments,
      total_paid: totalPaid,
      terms_paid: termsPaid,
      outstanding_fees: 'Calculated based on expected fees vs paid'
    });
  } catch (error) {
    console.error('Error fetching financial records:', error);
    res.status(500).json({ error: 'Failed to fetch financial records' });
  }
}

// Get all students
async function getAllStudents(req, res) {
  try {
    const [students] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}

// Create a new room
async function createRoom(req, res) {
  try {
    const { room_number, capacity } = req.body;

    if (!room_number || !capacity) {
      return res.status(400).json({ error: 'Room number and capacity are required' });
    }

    await pool.query(
      'INSERT INTO rooms (room_number, capacity) VALUES (?, ?)',
      [room_number, capacity]
    );

    res.status(201).json({
      message: 'Room created successfully',
      room_number,
      capacity
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Room number already exists' });
    }
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}

// Get all rooms
async function getAllRooms(req, res) {
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

// Get all room bookings
async function getRoomBookings(req, res) {
  try {
    const [bookings] = await pool.query(`
      SELECT rb.*, s.full_name, r.room_number, r.capacity 
      FROM room_bookings rb
      JOIN students s ON rb.student_id = s.student_id
      JOIN rooms r ON rb.room_id = r.id
      ORDER BY rb.booking_date DESC
    `);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

module.exports = {
  enrollStudent,
  getFinancialRecords,
  getAllStudents,
  createRoom,
  getAllRooms,
  getRoomBookings
};

const { pool } = require('../config/db');

// Student login
async function studentLogin(req, res) {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Check if student exists
    const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Login successful',
      student: students[0]
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// Pay fees
async function payFees(req, res) {
  try {
    const { student_id, amount, term } = req.body;

    if (!student_id || !amount || !term) {
      return res.status(400).json({ error: 'Student ID, amount, and term are required' });
    }

    // Check if student exists
    const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Record payment
    await pool.query(
      'INSERT INTO fee_payments (student_id, amount, term) VALUES (?, ?, ?)',
      [student_id, amount, term]
    );

    res.status(201).json({
      message: 'Payment successful',
      student_id,
      amount,
      term
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
}

// Book hostel room
async function bookHostelRoom(req, res) {
  try {
    const { student_id, room_id, term } = req.body;

    if (!student_id || !room_id || !term) {
      return res.status(400).json({ error: 'Student ID, room ID, and term are required' });
    }

    // Check if student exists
    const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student has paid fees for the term
    const [payments] = await pool.query(
      'SELECT * FROM fee_payments WHERE student_id = ? AND term = ?',
      [student_id, term]
    );

    if (payments.length === 0) {
      return res.status(403).json({ error: 'You must pay fees for this term before booking a room' });
    }

    // Check if room exists
    const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check room capacity
    const [currentBookings] = await pool.query(
      'SELECT COUNT(*) as count FROM room_bookings WHERE room_id = ? AND term = ?',
      [room_id, term]
    );

    if (currentBookings[0].count >= rooms[0].capacity) {
      return res.status(400).json({ error: 'Room is full for this term' });
    }

    // Check if student already has a booking for this term
    const [existingBooking] = await pool.query(
      'SELECT * FROM room_bookings WHERE student_id = ? AND term = ?',
      [student_id, term]
    );

    if (existingBooking.length > 0) {
      return res.status(400).json({ error: 'You already have a room booking for this term' });
    }

    // Create booking
    await pool.query(
      'INSERT INTO room_bookings (student_id, room_id, term) VALUES (?, ?, ?)',
      [student_id, room_id, term]
    );

    res.status(201).json({
      message: 'Room booked successfully',
      student_id,
      room_number: rooms[0].room_number,
      term
    });
  } catch (error) {
    console.error('Error booking room:', error);
    res.status(500).json({ error: 'Failed to book room' });
  }
}

// Get student's own financial records
async function getMyFinancialRecords(req, res) {
  try {
    const { student_id } = req.params;

    // Get all fee payments
    const [payments] = await pool.query(
      'SELECT * FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC',
      [student_id]
    );

    // Calculate total fees paid
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    res.json({
      payments,
      total_paid: totalPaid
    });
  } catch (error) {
    console.error('Error fetching financial records:', error);
    res.status(500).json({ error: 'Failed to fetch financial records' });
  }
}

// Get student's bookings
async function getMyBookings(req, res) {
  try {
    const { student_id } = req.params;

    const [bookings] = await pool.query(`
      SELECT rb.*, r.room_number, r.capacity 
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      WHERE rb.student_id = ?
      ORDER BY rb.booking_date DESC
    `, [student_id]);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

// Get available rooms for a term
async function getAvailableRooms(req, res) {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    const [rooms] = await pool.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM room_bookings WHERE room_id = r.id AND term = ?) as current_bookings,
        (r.capacity - (SELECT COUNT(*) FROM room_bookings WHERE room_id = r.id AND term = ?)) as available_spaces
      FROM rooms r
      HAVING available_spaces > 0
      ORDER BY r.room_number
    `, [term, term]);

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Failed to fetch available rooms' });
  }
}

module.exports = {
  studentLogin,
  payFees,
  bookHostelRoom,
  getMyFinancialRecords,
  getMyBookings,
  getAvailableRooms
};

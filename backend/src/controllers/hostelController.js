const { pool } = require('../config/database');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { room_number, capacity, description } = req.body;

    // Validate required fields
    if (!room_number || !capacity) {
      return res.status(400).json({ error: 'Room number and capacity are required' });
    }

    // Check if room already exists
    const [existing] = await pool.execute(
      'SELECT * FROM hostel_rooms WHERE room_number = ?',
      [room_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Room number already exists' });
    }

    // Insert room
    const [result] = await pool.execute(
      'INSERT INTO hostel_rooms (room_number, capacity, description) VALUES (?, ?, ?)',
      [room_number, capacity, description || null]
    );

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        id: result.insertId,
        room_number,
        capacity,
        description
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// Get all rooms with availability
const getAllRooms = async (req, res) => {
  try {
    const { term, academic_year } = req.query;

    const [rooms] = await pool.execute('SELECT * FROM hostel_rooms ORDER BY room_number');

    // If term and year provided, calculate availability
    if (term && academic_year) {
      const roomsWithAvailability = await Promise.all(
        rooms.map(async (room) => {
          const [bookings] = await pool.execute(
            'SELECT COUNT(*) as booked FROM room_bookings WHERE room_id = ? AND term = ? AND academic_year = ?',
            [room.id, term, academic_year]
          );
          return {
            ...room,
            booked: bookings[0].booked,
            available: room.capacity - bookings[0].booked
          };
        })
      );
      return res.json(roomsWithAvailability);
    }

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const [bookings] = await pool.execute(`
      SELECT 
        rb.id,
        rb.term,
        rb.academic_year,
        rb.booking_date,
        hr.room_number,
        hr.capacity,
        s.student_id,
        s.full_name
      FROM room_bookings rb
      JOIN hostel_rooms hr ON rb.room_id = hr.id
      JOIN students s ON rb.student_id = s.student_id
      ORDER BY rb.booking_date DESC
    `);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Book a room
const bookRoom = async (req, res) => {
  try {
    const { student_id, room_id, term, academic_year } = req.body;

    // Validate required fields
    if (!student_id || !room_id || !term || !academic_year) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify student exists
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student has paid fees for this term
    const [feeStructure] = await pool.execute(
      'SELECT * FROM fee_structure WHERE term = ? AND academic_year = ?',
      [term, academic_year]
    );

    if (feeStructure.length === 0) {
      return res.status(404).json({ error: 'Fee structure not found for the specified term' });
    }

    const [payments] = await pool.execute(
      'SELECT SUM(amount_paid) as total_paid FROM fee_payments WHERE student_id = ? AND term = ? AND academic_year = ?',
      [student_id, term, academic_year]
    );

    const totalPaid = payments[0].total_paid || 0;
    const totalFee = parseFloat(feeStructure[0].total_fee);

    if (totalPaid < totalFee) {
      return res.status(403).json({
        error: 'Cannot book room without paying fees for this term',
        total_fee: totalFee,
        total_paid: parseFloat(totalPaid),
        outstanding: totalFee - parseFloat(totalPaid)
      });
    }

    // Check if student already has a booking for this term
    const [existingBooking] = await pool.execute(
      'SELECT * FROM room_bookings WHERE student_id = ? AND term = ? AND academic_year = ?',
      [student_id, term, academic_year]
    );

    if (existingBooking.length > 0) {
      return res.status(400).json({ error: 'Student already has a room booking for this term' });
    }

    // Check room availability
    const [room] = await pool.execute(
      'SELECT * FROM hostel_rooms WHERE id = ?',
      [room_id]
    );

    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const [currentBookings] = await pool.execute(
      'SELECT COUNT(*) as booked FROM room_bookings WHERE room_id = ? AND term = ? AND academic_year = ?',
      [room_id, term, academic_year]
    );

    if (currentBookings[0].booked >= room[0].capacity) {
      return res.status(400).json({ error: 'Room is fully booked for this term' });
    }

    // Create booking
    await pool.execute(
      'INSERT INTO room_bookings (room_id, student_id, term, academic_year) VALUES (?, ?, ?, ?)',
      [room_id, student_id, term, academic_year]
    );

    res.status(201).json({
      message: 'Room booked successfully',
      booking: {
        student_id,
        room_number: room[0].room_number,
        term,
        academic_year
      }
    });
  } catch (error) {
    console.error('Error booking room:', error);
    res.status(500).json({ error: 'Failed to book room' });
  }
};

// Get student's bookings
const getStudentBookings = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [bookings] = await pool.execute(`
      SELECT 
        rb.id,
        rb.term,
        rb.academic_year,
        rb.booking_date,
        hr.room_number,
        hr.description
      FROM room_bookings rb
      JOIN hostel_rooms hr ON rb.room_id = hr.id
      WHERE rb.student_id = ?
      ORDER BY rb.academic_year DESC, rb.term DESC
    `, [studentId]);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getAllBookings,
  bookRoom,
  getStudentBookings
};

const express = require('express');
const router = express.Router();
const { studentLogin, getStudentById } = require('../controllers/studentController');
const { payFees, getStudentFinancials, checkFeePaid, getFeeStructure } = require('../controllers/feeController');
const { getAllRooms, bookRoom, getStudentBookings } = require('../controllers/hostelController');

// Student authentication
router.post('/login', studentLogin);

// Get student profile
router.get('/profile/:studentId', getStudentById);

// Fee management
router.get('/fee-structure', getFeeStructure);
router.post('/pay-fees', payFees);
router.get('/financials/:studentId', getStudentFinancials);
router.get('/check-fee/:studentId/:term/:academicYear', checkFeePaid);

// Hostel booking
router.get('/rooms', getAllRooms);
router.post('/book-room', bookRoom);
router.get('/bookings/:studentId', getStudentBookings);

module.exports = router;

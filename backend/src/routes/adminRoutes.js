const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminController');
const { enrollStudent, getAllStudents, getStudentById } = require('../controllers/studentController');
const { getStudentFinancials, getFeeStructure } = require('../controllers/feeController');
const { createRoom, getAllRooms, getAllBookings } = require('../controllers/hostelController');

// Admin authentication
router.post('/login', adminLogin);

// Student management
router.post('/students', enrollStudent);
router.get('/students', getAllStudents);
router.get('/students/:studentId', getStudentById);

// Financial records
router.get('/students/:studentId/financials', getStudentFinancials);
router.get('/fee-structure', getFeeStructure);

// Hostel management
router.post('/rooms', createRoom);
router.get('/rooms', getAllRooms);
router.get('/bookings', getAllBookings);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  enrollStudent,
  getFinancialRecords,
  getAllStudents,
  createRoom,
  getAllRooms,
  getRoomBookings
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// All admin routes require authentication
router.use(authenticateAdmin);

// Student management
router.post('/students/enroll', enrollStudent);
router.get('/students', getAllStudents);
router.get('/students/:student_id/financial-records', getFinancialRecords);

// Hostel management
router.post('/rooms', createRoom);
router.get('/rooms', getAllRooms);
router.get('/bookings', getRoomBookings);

module.exports = router;

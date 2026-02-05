const express = require('express');
const router = express.Router();
const {
  studentLogin,
  payFees,
  bookHostelRoom,
  getMyFinancialRecords,
  getMyBookings,
  getAvailableRooms
} = require('../controllers/studentController');

// Student routes
router.post('/login', studentLogin);
router.post('/pay-fees', payFees);
router.post('/book-room', bookHostelRoom);
router.get('/:student_id/financial-records', getMyFinancialRecords);
router.get('/:student_id/bookings', getMyBookings);
router.get('/rooms/available', getAvailableRooms);

module.exports = router;

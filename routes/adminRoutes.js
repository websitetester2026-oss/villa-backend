const express = require('express');
const router = express.Router();
const { authAdmin, getBookings, updateBookingStatus, createVilla } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.get('/bookings', protectAdmin, getBookings);
router.patch('/booking-status', protectAdmin, updateBookingStatus);
router.post('/villas', protectAdmin, createVilla);

module.exports = router;

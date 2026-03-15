const express = require('express');
const router = express.Router();
const { getVillas, getBookings, getBookedDates, checkAvailability, createBooking, paymentSuccess, paymentCancel } = require('../controllers/guestController');

router.get('/villas', getVillas);
router.get('/bookings', getBookings);
router.get('/booked-dates', getBookedDates);
router.get('/availability', checkAvailability);
router.post('/bookings', createBooking);
router.get('/payment-success', paymentSuccess);
router.get('/payment-cancel', paymentCancel);

module.exports = router;

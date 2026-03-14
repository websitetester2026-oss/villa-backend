const User = require('../models/User');
const Villa = require('../models/Villa');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// Generate JWT for Admin
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth admin user & get token
// @route   POST /admin/api/login
// @access  Public
const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // In a real app, ensure you create a root admin manually first or via a seed script
    // Check password and verify it's an admin
    if (user && (await user.matchPassword(password))) {
        if (user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized as an admin' });
        }
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get all bookings
// @route   GET /admin/api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('userId', 'name email')
            .populate('villaId', 'villaName');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching bookings' });
    }
};

// @desc    Update booking status (approve/cancel)
// @route   PATCH /admin/api/booking-status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
    const { bookingId, status } = req.body;

    if (!['pending', 'approved', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const booking = await Booking.findById(bookingId);

        if (booking) {
            booking.bookingStatus = status;
            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating booking' });
    }
};

// @desc    Create a villa
// @route   POST /admin/api/villas
// @access  Private/Admin
const createVilla = async (req, res) => {
    const { villaName, bedrooms, bathrooms, maxGuests, pricePerNight, description } = req.body;

    if (!villaName || !bedrooms || !bathrooms || !maxGuests || !pricePerNight || !description) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const villa = await Villa.create({
            villaName,
            bedrooms,
            bathrooms,
            maxGuests,
            pricePerNight,
            description
        });

        res.status(201).json(villa);
    } catch (error) {
        res.status(500).json({ message: 'Server Error creating villa' });
    }
};

module.exports = {
    authAdmin,
    getBookings,
    updateBookingStatus,
    createVilla
};

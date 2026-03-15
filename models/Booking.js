const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        guestName: {
            type: String,
            required: true,
        },
        guestEmail: {
            type: String,
            required: true,
        },
        villaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Villa',
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        numberOfGuests: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        bookingStatus: {
            type: String,
            enum: ['pending', 'approved', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

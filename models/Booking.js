const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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
        guests: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
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

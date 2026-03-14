const mongoose = require('mongoose');

const villaSchema = mongoose.Schema(
    {
        villaName: {
            type: String,
            required: true,
        },
        bedrooms: {
            type: Number,
            required: true,
        },
        bathrooms: {
            type: Number,
            required: true,
        },
        maxGuests: {
            type: Number,
            required: true,
        },
        pricePerNight: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Villa = mongoose.model('Villa', villaSchema);

module.exports = Villa;

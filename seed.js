const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Models
const User = require('./models/User');
const Villa = require('./models/Villa');
const Booking = require('./models/Booking');

// DB Connection
const connectDB = async () => {
    try {
         await mongoose.connect(process.env.MONGO_URI);
         console.log('MongoDB Connected for Seeding...');
    } catch (error) {
         console.error(`Error: ${error.message}`);
         process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Booking.deleteMany();
        await Villa.deleteMany();
        await User.deleteMany();

        // Admin User
        const adminUser = {
            name: 'Admin User',
            email: 'admin@villaresort.com',
            password: 'password123',
            role: 'admin'
        };
        const createdUser = await User.create(adminUser);

        // Sample Villas
        const villas = [
            {
                villaName: 'Ocean View Retreat',
                bedrooms: 4,
                bathrooms: 4,
                maxGuests: 8,
                pricePerNight: 850,
                description: 'A luxurious 4-bedroom villa with stunning ocean views, a private infinity pool, and modern amenities. Perfect for families or groups seeking a serene getaway.'
            },
            {
                villaName: 'Tropical Garden Sanctuary',
                bedrooms: 2,
                bathrooms: 2,
                maxGuests: 4,
                pricePerNight: 400,
                description: 'Surrounded by lush tropical gardens, this 2-bedroom sanctuary offers absolute privacy, a plunge pool, and an outdoor shower.'
            },
            {
                villaName: 'The Grand Estate',
                bedrooms: 6,
                bathrooms: 7,
                maxGuests: 12,
                pricePerNight: 1500,
                description: 'Our most exclusive property featuring 6 bedrooms, a private cinema, a gym, and a fully staffed kitchen to cater to your every need.'
            }
        ];

        await Villa.insertMany(villas);

        console.log('Data Imported Successfully!');
        console.log('Admin Email: admin@villaresort.com');
        console.log('Admin Password: password123');
        process.exit();
    } catch (error) {
        console.error(`Error with Seeding: ${error}`);
        process.exit(1);
    }
};

importData();

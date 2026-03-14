const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Villa = require('../models/Villa');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI || "mongodb+srv://websitetester2026_db_user:FYzyEVEHkHGxbwq3@cluster0.gurij8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        if (uri === 'mongodb-memory-server') {
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log('MongoDB Memory Server started');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const User = require('../models/User');
        // Auto seed for empty db
        const count = await Villa.countDocuments();
        if (count === 0) {
            console.log("Empty DB detected, auto-seeding test villas and admin...");
            
            await User.create({
                name: 'Super Admin',
                email: 'admin@villa.com',
                password: 'password123',
                role: 'admin'
            });

            await Villa.insertMany([
                { villaName: 'Ocean View Retreat', bedrooms: 4, bathrooms: 4, maxGuests: 8, pricePerNight: 850, description: '...' },
                { villaName: 'Garden Suite', bedrooms: 1, bathrooms: 1, maxGuests: 2, pricePerNight: 350, description: '...' },
                { villaName: 'Master Suite Ocean', bedrooms: 1, bathrooms: 1, maxGuests: 2, pricePerNight: 450, description: '...' }
            ]);
            console.log("Villas and Admin seeded successfully.");
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

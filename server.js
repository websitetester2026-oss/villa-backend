const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for admin dashboard
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Routes (to be loaded)
app.use('/api', require('./routes/guestRoutes'));
app.use('/admin/api', require('./routes/adminRoutes'));

// Root endpoint test
app.get('/', (req, res) => {
    res.json({ message: 'Villa Booking API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

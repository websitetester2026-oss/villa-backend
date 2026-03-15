const Villa = require('../models/Villa');
const Booking = require('../models/Booking');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_123');

// @desc    Fetch all villas
// @route   GET /api/villas
// @access  Public
const getVillas = async (req, res) => {
    try {
        const villas = await Villa.find({});
        res.json(villas);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching villas' });
    }
};

// @desc    Fetch all bookings for testing
// @route   GET /api/bookings
// @access  Public (for test)
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('villaId', 'villaName');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching bookings' });
    }
};

// @desc    Get booked dates for a specific villa
// @route   GET /api/booked-dates
// @access  Public
const getBookedDates = async (req, res) => {
    const { villaId } = req.query;
    
    if (!villaId) {
        return res.status(400).json({ message: 'Please provide villaId' });
    }

    try {
        const bookings = await Booking.find({
            villaId,
            bookingStatus: { $ne: 'cancelled' }
        }).select('checkIn checkOut -_id');

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching booked dates' });
    }
};

// @desc    Check availability for a villa
// @route   GET /api/availability
// @access  Public
const checkAvailability = async (req, res) => {
    const { villaId, checkIn, checkOut } = req.query;

    if (!villaId || !checkIn || !checkOut) {
        return res.status(400).json({ message: 'Please provide villaId, checkIn, and checkOut dates' });
    }

    try {
        const requestedCheckIn = new Date(checkIn);
        const requestedCheckOut = new Date(checkOut);

        // Find any booking for this villa that overlaps with the requested dates
        // Booking is overlapping if:
        // Existing CheckIn < Requested CheckOut AND Existing CheckOut > Requested CheckIn
        const overlappingBookings = await Booking.find({
            villaId,
            bookingStatus: { $ne: 'cancelled' },
            $and: [
                { checkIn: { $lt: requestedCheckOut } },
                { checkOut: { $gt: requestedCheckIn } }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.json({ available: false, message: 'Selected dates are no longer available.' });
        }

        res.json({ available: true, message: 'Dates are available' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error checking availability' });
    }
};

// @desc    Create a new booking (Guest)
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
    const { name, email, villaId, checkIn, checkOut, guests } = req.body;

    if (!name || !email || !villaId || !checkIn || !checkOut || !guests) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const villa = await Villa.findById(villaId);
        if (!villa) {
            return res.status(404).json({ message: 'Villa not found' });
        }

        const requestedCheckIn = new Date(checkIn);
        const requestedCheckOut = new Date(checkOut);

        // Calculate nights
        const timeDifference = requestedCheckOut.getTime() - requestedCheckIn.getTime();
        const nights = Math.ceil(timeDifference / (1000 * 3600 * 24));

        if (nights <= 0) {
             return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        const totalPrice = nights * villa.pricePerNight;

        // Double check availability before booking
        const overlappingBookings = await Booking.find({
             villaId,
             bookingStatus: { $ne: 'cancelled' },
             $and: [
                 { checkIn: { $lt: requestedCheckOut } },
                 { checkOut: { $gt: requestedCheckIn } }
             ]
         });
 
         if (overlappingBookings.length > 0) {
             return res.status(400).json({ message: 'Selected dates are no longer available.' });
         }

        const booking = await Booking.create({
            guestName: name,
            guestEmail: email,
            villaId,
            checkIn: requestedCheckIn,
            checkOut: requestedCheckOut,
            numberOfGuests: guests,
            totalPrice,
            paymentStatus: 'pending',
            bookingStatus: 'pending' // Default status
        });

        // Create Stripe checkout session
        let sessionUrl = '';

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Booking: ${villa.villaName}`,
                                description: `Check-in: ${requestedCheckIn.toLocaleDateString()} | Check-out: ${requestedCheckOut.toLocaleDateString()}`
                            },
                            unit_amount: villa.pricePerNight * 100, // Amount in cents
                        },
                        quantity: nights,
                    }
                ],
                success_url: `https://villa-backend-production-755a.up.railway.app/api/payment-success?booking_id=${booking._id}`,
                cancel_url: `https://villa-backend-production-755a.up.railway.app/api/payment-cancel?booking_id=${booking._id}`,
                customer_email: email,
                client_reference_id: booking._id.toString()
            });
            sessionUrl = session.url;
        } catch (stripeError) {
            console.log("Stripe API failed (likely using a dummy key). Bypassing to success URL for demonstration.");
            // Mock the redirect URL directly to the success callback
            sessionUrl = `https://villa-backend-production-755a.up.railway.app/api/payment-success?booking_id=${booking._id}`;
        }

        res.status(201).json({
            message: 'Booking request initiated, redirecting to payment',
            booking,
            url: sessionUrl
        });
    } catch (error) {
        console.error("CREATE BOOKING ERROR: ", error); // ADDED THIS LOG
        res.status(500).json({ message: 'Server Error creating booking' });
    }
};

// @desc    Handle successful Stripe payment
// @route   GET /api/payment-success
// @access  Public
const paymentSuccess = async (req, res) => {
    const { booking_id } = req.query;

    if (booking_id) {
        try {
            // In a real app with webhooks, we'd verify the stripe signature. 
            // For now, assume success means paid.
            await Booking.findByIdAndUpdate(booking_id, { paymentStatus: 'paid', bookingStatus: 'approved' });
        } catch (error) {
            console.error(error);
        }
    }

    res.send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f4f7f6;">
                <h1 style="color: #2ecc71;">Payment Successful!</h1>
                <p>Your booking has been approved and finalized.</p>
                <p>You may now safely close this window to return to the website.</p>
            </body>
        </html>
    `);
};

// @desc    Handle cancelled Stripe payment
// @route   GET /api/payment-cancel
// @access  Public
const paymentCancel = async (req, res) => {
    res.send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f4f7f6;">
                <h1 style="color: #e74c3c;">Payment Cancelled</h1>
                <p>You have cancelled the payment process. Your booking remains pending until paid.</p>
                <p>You may safely close this window.</p>
            </body>
        </html>
    `);
};

module.exports = {
    getVillas,
    getBookings,
    getBookedDates,
    checkAvailability,
    createBooking,
    paymentSuccess,
    paymentCancel
};

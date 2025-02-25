const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
require('dotenv').config();

// Ensure Stripe API Key is set
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('⚠️  Stripe API Key is missing! Check your .env file.');
    process.exit(1);
}

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Passport config
require('./config/passport')(passport);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// EJS setup
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');

// Default route for Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/', authRoutes);
app.use('/shop', shopRoutes);
app.use('/order', orderRoutes);
app.use('/admin', adminRoutes);

// Serve the Photos page
app.get('/photos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'photos.html'));
});

// Serve the Checkout page
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

// Serve the User Orders page
app.get('/userOrders', (req, res) => {
    res.render('userOrders');
});

// Serve the Cart page
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

// Stripe Payment Intent API
app.post('/create-payment-intent', async (req, res) => {
    const { items } = req.body;

    try {
        // Calculate total amount in cents
        const amount = items.reduce((total, item) => total + item.price * item.quantity, 0) * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('❌ Stripe Payment Intent Error:', error.message);
        res.status(500).json({ error: 'Payment initialization failed.' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

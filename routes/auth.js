// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');

// Serve Registration Page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'register.html'));
});

// Serve Login Page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

// Serve My Orders Page
router.get('/userOrders', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'myOrders.html'));
});

// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    
    // Validate passwords match
    if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/register');
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        req.flash('error_msg', 'Email is already registered');
        return res.redirect('/register');
    }

    // Create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
});

// Login Route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/shop',
    failureRedirect: '/login',
    failureFlash: true
}));

// Logout Route (Updated for Express 5+)
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

module.exports = router;

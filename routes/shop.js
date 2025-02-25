// routes/shop.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Correctly serve the shop page as a static HTML file
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'shop.html'));
});

module.exports = router;

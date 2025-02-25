const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Calculate shipping rates with ShipEngine API
router.post('/shipping/rates', async (req, res) => {
    const { address, city, postalCode, country } = req.body;

    try {
        const response = await axios.post('https://api.shipengine.com/v1/rates/estimate', {
            carrier_ids: [], // Add carrier IDs if you want to specify (e.g., UPS, FedEx, USPS)
            from_country_code: 'US',
            from_postal_code: '79567',
            to_country_code: country,
            to_postal_code: postalCode,
            weight: { value: 5, unit: 'pound' },
            dimensions: { unit: 'inch', length: 10, width: 5, height: 5 }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'API-Key': process.env.SHIPENGINE_API_KEY
            }
        });

        const rates = response.data.rate_response.rates;
        const shippingRates = rates.map(rate => ({
            carrier: rate.carrier_friendly_name,
            service: rate.service_type,
            estimated_days: rate.estimated_delivery_days,
            rate: rate.shipping_amount.amount
        }));

        res.json(shippingRates);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Error fetching shipping rates');
    }
});

// Generate tracking link (Example for ShipEngine)
router.get('/shipping/track/:trackingNumber', async (req, res) => {
    const { trackingNumber } = req.params;
    try {
        const response = await axios.get(`https://api.shipengine.com/v1/tracking?carrier_code=ups&tracking_number=${trackingNumber}`, {
            headers: {
                'API-Key': process.env.SHIPENGINE_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Error fetching tracking information');
    }
});

module.exports = router;


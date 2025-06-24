const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');

router.get('/', async (req, res) => {
    const destinations = await Destination.find();
    res.render('home', { destinations });
});

router.get('/destination/:id', async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    res.render('destination', { destination });
});

module.exports = router;
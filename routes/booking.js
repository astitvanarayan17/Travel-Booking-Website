const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');

router.get('/:id', async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    res.render('booking', { destination });
});

router.post('/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    const { date, numPeople } = req.body;
    await Booking.create({
        userId: req.session.userId,
        destinationId: req.params.id,
        date,
        numPeople
    });
    res.send('Booking Successful');
});

module.exports = router;
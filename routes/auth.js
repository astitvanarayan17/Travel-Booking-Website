const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed }).save();
    res.redirect('/auth/login');
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(user && await bcrypt.compare(password, user.password)){
        req.session.userId = user._id;
        res.redirect('/');
    } else {
        res.send('Invalid credentials');
    }
});

module.exports = router;
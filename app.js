const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/booking', bookingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
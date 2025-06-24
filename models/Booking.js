const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    destinationId: mongoose.Schema.Types.ObjectId,
    date: Date,
    numPeople: Number
});
module.exports = mongoose.model('Booking', bookingSchema);
const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    name: String,
    trainNumber: String,
    from: String,
    to: String,
    departureTime: String,
    arrivalTime: String,
    price: Number,
    seatsAvailable: Number
});

module.exports = mongoose.model("Train", trainSchema);
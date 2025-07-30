const mongoose = require("mongoose");

const airportSchema = new mongoose.Schema({
    IATA_code: String,
    city_name: String
});

module.exports = mongoose.model("Airport", airportSchema);

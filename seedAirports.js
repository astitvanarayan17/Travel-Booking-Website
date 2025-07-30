// seedAirports.js
const mongoose = require("mongoose");
const Airport = require("./models/airport"); // adjust path if needed

mongoose.connect("mongodb://127.0.0.1:27017/flightDB")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error", err));

const airports = [
    { IATA_code: "DEL", city_name: "Delhi" },
    { IATA_code: "BOM", city_name: "Mumbai" },
    { IATA_code: "BLR", city_name: "Bengaluru" },
    { IATA_code: "HYD", city_name: "Hyderabad" },
    { IATA_code: "MAA", city_name: "Chennai" },
];

Airport.insertMany(airports)
    .then(() => {
        console.log("✅ Sample airports inserted successfully.");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("Insert error", err);
        mongoose.connection.close();
    });

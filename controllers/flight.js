require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");

// Home or main flights page
const Airport = require("../models/airport"); // make sure this model exists

module.exports.index = async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }
        
        const airports = await Airport.find({});
        res.render("flights/index", { airports });
    } catch (err) {
        console.error("Error loading airports:", err);
        req.flash("error", "Unable to load airports. Please try again later.");
        // Render the page with empty airports array instead of redirecting
        res.render("flights/index", { airports: [] });
    }
};


// Renders the search form
module.exports.renderSearch = (req, res) => {
    const details = req.session.details || [];
    res.render("flights/search", { details });
};

// Calls the Aviation API and shows flights
module.exports.findFlights = async (req, res) => {
    const { from, to, date, passengerCount, group } = req.body;

    try {
        // Check if API key is available
        if (!process.env.AVIATION_API_KEY || process.env.AVIATION_API_KEY === 'your_aviation_api_key_here') {
            console.log("No valid API key found, using fallback data");
            return await generateFallbackFlights(req, res, { from, to, date, passengerCount, group });
        }

        const response = await axios.get("http://api.aviationstack.com/v1/flights", {
            params: {
                access_key: process.env.AVIATION_API_KEY,
                dep_iata: from.toUpperCase(),
                arr_iata: to.toUpperCase(),
                flight_date: date
            }
        });

        console.log("API Key used:", process.env.AVIATION_API_KEY ? "Key provided" : "No key");
        console.log("Flight API response status:", response.status);

        const apiData = response.data.data;

        if (!apiData || apiData.length === 0) {
            console.log("No API data found, using fallback");
            return await generateFallbackFlights(req, res, { from, to, date, passengerCount, group });
        }

        const details = apiData.slice(0, 10).map(flight => ({
            from: flight.departure.iata,
            to: flight.arrival.iata,
            departureTime: flight.departure.scheduled,
            arrivalTime: flight.arrival.scheduled,
            airline: flight.airline.name,
            flightNo: flight.flight.iata,
            terminal: flight.departure.terminal || "N/A",
            gate: flight.departure.gate || "N/A",
            duration: "N/A",
            passengerCount: parseInt(passengerCount),
            group: group,
            passengers: [],
            price: Math.floor(Math.random() * 5000 + 2500)
        }));

        req.session.details = details;
        res.redirect("/search");

    } catch (err) {
        console.error("API fetch error:", err.message);
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
        
        // If API fails, use fallback data
        if (err.response?.status === 403 || err.response?.status === 401) {
            console.log("API authentication failed, using fallback data");
            return await generateFallbackFlights(req, res, { from, to, date, passengerCount, group });
        }
        
        req.flash("error", "Unable to fetch flights. Using sample data instead.");
        return await generateFallbackFlights(req, res, { from, to, date, passengerCount, group });
    }
};

// Fallback function to generate sample flight data
async function generateFallbackFlights(req, res, { from, to, date, passengerCount, group }) {
    const { generateDetails } = require("../utils/helperFunctions");
    
    try {
        // Generate sample flight details
        const details = generateDetails(from, to, date, passengerCount, group);
        
        // Convert to the expected format
        const formattedDetails = details.map(detail => {
            // Parse the date properly (assuming format DD.MM.YYYY from the form)
            const [day, month, year] = date.split('.');
            const departureDate = new Date(year, month - 1, day);
            
            // Add time to the date
            const [depHours, depMins] = detail.fromTime.split(':');
            const [arrHours, arrMins] = detail.toTime.split(':');
            
            departureDate.setHours(parseInt(depHours), parseInt(depMins));
            const arrivalDate = new Date(departureDate);
            arrivalDate.setHours(parseInt(arrHours), parseInt(arrMins));
            
            return {
                from: detail.from,
                to: detail.to,
                departureTime: departureDate.toISOString(),
                arrivalTime: arrivalDate.toISOString(),
                airline: detail.airline,
                flightNo: `${detail.airline.substring(0, 2)}${Math.floor(Math.random() * 9999)}`,
                terminal: Math.floor(Math.random() * 5) + 1,
                gate: String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random() * 50),
                duration: detail.duration,
                passengerCount: parseInt(passengerCount),
                group: group,
                passengers: [],
                price: detail.price
            };
        });

        req.session.details = formattedDetails;
        req.flash("success", "Sample flight data loaded successfully!");
        res.redirect("/search");
    } catch (error) {
        console.error("Fallback generation error:", error);
        req.flash("error", "Unable to generate flight data. Please try again.");
        res.redirect("/");
    }
}

// Stores selected flight details into session
module.exports.storeFlightDetails = (req, res) => {
    const { index } = req.body;
    const flightDetails = req.session.details[index];
    req.session.selectedFlight = flightDetails;
    res.redirect("/review");
};

// Shows the review page
module.exports.renderReview = (req, res) => {
    const flight = req.session.selectedFlight;
    res.render("flights/review", { flight });
};

// Shows the form to enter passenger details
module.exports.renderTravellerForm = (req, res) => {
    const flight = req.session.selectedFlight;
    res.render("flights/traveller", { flight });
};

// Book the ticket (save booking info)
module.exports.bookTicket = (req, res) => {
    const { name, email, age, gender } = req.body;
    const flight = req.session.selectedFlight;

    if (!req.session.bookings) {
        req.session.bookings = [];
    }

    const passengers = Array.isArray(name)
        ? name.map((n, i) => ({
              name: n,
              email: email[i],
              age: age[i],
              gender: gender[i]
          }))
        : [{ name, email, age, gender }];

    flight.passengers = passengers;
    req.session.bookings.push(flight);
    res.redirect("/bookings");
};

// View all bookings
module.exports.showBookings = (req, res) => {
    const bookings = req.session.bookings || [];
    res.render("flights/bookings", { bookings });
};

// Show the boarding pass
module.exports.showBoardingPass = (req, res) => {
    const { id } = req.params;
    const flight = req.session.bookings[id];
    res.render("flights/boarding-pass", { flight });
};

// Render cancel booking page
module.exports.renderCancel = (req, res) => {
    const bookings = req.session.bookings || [];
    res.render("flights/cancel", { bookings });
};

// Delete a booking
module.exports.deleteBookings = (req, res) => {
    const { id } = req.params;
    if (req.session.bookings) {
        req.session.bookings.splice(id, 1);
    }
    res.redirect("/bookings");
};

require("dotenv").config();

// Home or main flights page
const Airport = require("../models/airport");

module.exports.index = async (req, res) => {
    try {

        // Fetch airports directly
        const airports = await Airport.find({});

        res.render("flights/index", { airports });

    } catch (err) {

        console.error("Error loading airports:", err);

        req.flash(
            "error",
            "Unable to load airports. Please try again later."
        );

        // Render empty airports array if error occurs
        res.render("flights/index", { airports: [] });
    }
};

// Renders the search form
module.exports.renderSearch = (req, res) => {
    const details = req.session.details || [];
    const { sortby } = req.query;
    
    // Apply sorting if requested
    if (sortby && details.length > 0) {
        const { sorting } = require("../utils/helperFunctions");
        const sortedDetails = sorting([...details], sortby);
        req.session.details = sortedDetails;
    }
    
    res.render("flights/search", { details: req.session.details || details });
};

// Generate mock flight data instead of calling API
module.exports.findFlights = (req, res) => {
    const { from, to, date, passengerCount, group } = req.body;

    // Validate required fields
    if (!from || !to || !date || !passengerCount || !group) {
        req.flash("error", "Please fill in all required fields.");
        return res.redirect("/");
    }

    console.log("=== Flight Search Request ===");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Date:", date);
    console.log("Passengers:", passengerCount);
    console.log("Class:", group);

    try {
        // Generate mock flight data
        const airlines = [
            { name: "Air India", code: "AI" },
            { name: "IndiGo", code: "6E" },
            { name: "Vistara", code: "UK" },
            { name: "SpiceJet", code: "SG" },
            { name: "GoAir", code: "G8" }
        ];

        const priceRanges = {
            Economy: { min: 3000, max: 8000 },
            Premium: { min: 8000, max: 15000 }
        };

        const baseDate = new Date(date + 'T00:00:00');
        const details = [];

        // Generate 5 mock flights
        for (let i = 0; i < 5; i++) {
            const airline = airlines[i % airlines.length];
            const startHour = 6 + (i * 3); // Flights starting from 6 AM, spaced 3 hours apart
            const duration = 2 + Math.random(); // 2-3 hours
            
            const departTime = new Date(baseDate);
            departTime.setHours(startHour, Math.floor(Math.random() * 60), 0);
            
            const arriveTime = new Date(departTime);
            arriveTime.setHours(arriveTime.getHours() + Math.floor(duration));
            arriveTime.setMinutes(arriveTime.getMinutes() + Math.floor((duration % 1) * 60));

            const durationHours = Math.floor(duration);
            const durationMinutes = Math.floor((duration % 1) * 60);
            const durationStr = `${durationHours}h ${durationMinutes}m`;

            const fromTime = departTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const toTime = arriveTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const priceRange = priceRanges[group];
            const price = Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;

            details.push({
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                departureTime: departTime.toISOString(),
                arrivalTime: arriveTime.toISOString(),
                fromTime: fromTime,
                toTime: toTime,
                airline: airline.name,
                flightNo: `${airline.code}${100 + i}`,
                flightNumber: `${airline.code}${1000 + i}`,
                terminal: `${1 + i}`,
                gate: `${String.fromCharCode(65 + i)}${1 + i}`,
                duration: durationStr,
                passengerCount: parseInt(passengerCount),
                group: group,
                passengers: [],
                price: price,
                date: date
            });
        }

        console.log("Generated mock flights:", details.length);
        req.session.details = details;
        res.redirect("/search");

    } catch (err) {
        console.error("Error generating flights:", err.message);
        req.flash("error", "Unable to fetch flights. Please try again later.");
        return res.redirect("/");
    }
};

// Stores selected flight details into session
module.exports.storeFlightDetails = (req, res) => {
    const { index } = req.body;
    
    // Check if session has details
    if (!req.session.details || !req.session.details[index]) {
        req.flash("error", "Flight data not found. Please search again.");
        return res.redirect("/");
    }
    
    const flightDetails = req.session.details[index];
    req.session.selectedFlight = flightDetails;
    res.redirect("/review");
};

// Shows the review page
module.exports.renderReview = (req, res) => {
    const flight = req.session.selectedFlight;
    if (!flight) {
        req.flash("error", "Please select a flight first.");
        return res.redirect("/");
    }
    res.render("flights/review", { detail: flight });
};

// Shows the form to enter passenger details
module.exports.renderTravellerForm = (req, res) => {
    const flight = req.session.selectedFlight;
    if (!flight) {
        req.flash("error", "Please select a flight first.");
        return res.redirect("/");
    }
    res.render("flights/traveller", { detail: flight });
};

// Book the ticket (save passenger info and redirect to payment)
module.exports.bookTicket = (req, res) => {
    const { name, email, age, gender } = req.body;
    const flight = req.session.selectedFlight;

    if (!flight) {
        req.flash("error", "Flight data not found. Please select a flight again.");
        return res.redirect("/");
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
    req.session.selectedFlight = flight;
    res.redirect("/payment");
};

// Show payment page
module.exports.renderPayment = (req, res) => {
    const flight = req.session.selectedFlight;
    if (!flight) {
        req.flash("error", "Flight data not found. Please select a flight again.");
        return res.redirect("/");
    }
    res.render("flights/payment", { detail: flight });
};

// Process payment and complete booking
module.exports.processPayment = (req, res) => {
    const { paymentMethod, terms } = req.body;
    const flight = req.session.selectedFlight;

    if (!flight) {
        req.flash("error", "Flight data not found. Please start over.");
        return res.redirect("/");
    }

    if (!terms) {
        req.flash("error", "Please agree to the terms and conditions.");
        return res.redirect("/payment");
    }

    // Validate payment data
    if (paymentMethod === 'card') {
        const { cardNumber, cvv } = req.body;
        if (!cardNumber || !cvv) {
            req.flash("error", "Please fill in all card details.");
            return res.redirect("/payment");
        }
    } else if (paymentMethod === 'upi') {
        const { upiId } = req.body;
        if (!upiId) {
            req.flash("error", "Please enter your UPI ID.");
            return res.redirect("/payment");
        }
    } else if (paymentMethod === 'wallet') {
        const { wallet } = req.body;
        if (!wallet) {
            req.flash("error", "Please select a wallet.");
            return res.redirect("/payment");
        }
    } else if (paymentMethod === 'netbanking') {
        const { bank } = req.body;
        if (!bank) {
            req.flash("error", "Please select a bank.");
            return res.redirect("/payment");
        }
    }

    // Add payment method and email to flight
    flight.paymentMethod = paymentMethod;
    flight.billingEmail = req.body.email;

    // Add booking to bookings array
    if (!req.session.bookings) {
        req.session.bookings = [];
    }

    req.session.bookings.push(flight);

    // Clear session data
    req.session.selectedFlight = null;

    req.flash("success", "✅ Payment successful! Your flight is booked.");
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

// API Health Check (removed - no longer using external API)
module.exports.apiHealthCheck = (req, res) => {
    return res.json({ 
        status: 'healthy', 
        message: 'Using mock flight data - no external API required',
        timestamp: new Date().toISOString()
    });
};

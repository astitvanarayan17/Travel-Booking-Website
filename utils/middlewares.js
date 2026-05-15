const airportsList = require("../utils/airportsList");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.validateSearchData = (req, res, next) => {
    const { from, to, date } = req.body;
    const airports = airportsList.airports;
    let flagFrom = false,
        flagTo = false;

    if (from.toUpperCase() === to.toUpperCase()) {
        req.flash("error", "Please select different Destination and Arrival.");
        return res.redirect("/");
    }

    airports.forEach(airport => {
        if (from.toUpperCase() === airport.IATA_code ) flagFrom = true;
        if (to.toUpperCase() === airport.IATA_code ) flagTo = true;
        if (flagTo && flagFrom) return;
    });
    if (!flagFrom || !flagTo) {
        req.flash("error", "Please select a valid Airport Code.");
        return res.redirect("/");
    }
 
    // Date Validation (date comes in YYYY-MM-DD format from HTML date input)
    const selectedDate = new Date(date + 'T00:00:00Z'); // Add time to ensure proper parsing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!date || isNaN(selectedDate.getTime()) || selectedDate < today) {
        req.flash("error", "Please select a valid future date.");
        return res.redirect("/");
    }
    next();
}

module.exports.validateBookingId = (req, res, next) => {
    try {
        const { id } = req.params;
        const bookings = req.session.bookings || [];
        
        if (id >= 0 && id < bookings.length) {
            return next();
        }
        
        req.flash("error", "Invalid Boarding Pass");
        res.redirect("/bookings");
    } catch (err) {
        req.flash("error", "Invalid Boarding Pass");
        res.redirect("/bookings");
    }
};
const express = require("express"),
    router = express.Router(),
    _ = require("lodash"),
    passport = require("passport");

const catchAsync = require("../utils/catchAsync"),
    { isLoggedIn, validateSearchData, validateBookingId } = require("../utils/middlewares");

const flight = require("../controllers/flight");

router.route("/")
    .get(flight.index)
    .post(validateSearchData, flight.findFlights);

router.route("/search")
    .get(flight.renderSearch)
    .post(flight.storeFlightDetails);

router.route("/review")
    .get(flight.renderReview);

router.route("/traveller")
    .get(flight.renderTravellerForm)
    .post(isLoggedIn, flight.bookTicket);

router.route("/payment")
    .get(isLoggedIn, flight.renderPayment)
    .post(isLoggedIn, flight.processPayment);

router.route("/bookings")
    .get(isLoggedIn, flight.showBookings);

router.route("/boarding-pass/:id")
    .get(validateBookingId, flight.showBoardingPass);

router.route("/cancel/:id")
    .get(isLoggedIn, validateBookingId, flight.renderCancel);

router.route("/cancel/:id")
    .post(isLoggedIn, validateBookingId, flight.deleteBookings);

// API Health Check endpoint
router.route("/api/health")
    .get(flight.apiHealthCheck);

module.exports = router;

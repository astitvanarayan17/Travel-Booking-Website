const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");
const { trains } = require("../utils/trainList");

// All Trains
router.get("/", trainController.index);

// Add New Train (Form & Submission)
router.get("/new", trainController.newTrainForm);
router.post("/", trainController.createTrain);

// View Specific Train
router.get("/:id", trainController.showTrain);

// Book a Train
router.post("/:id/book", trainController.bookSeat);

// ✅ Train Search Route
router.post("/search", (req, res) => {
  const {
    from,
    to,
    class: travelClass,
    passengers,
    type,
    date,
    via,
  } = req.body;

  // Filter trains from static list
  const matchedTrains = trains.filter(
    (train) =>
      train.source.toLowerCase() === from.toLowerCase() &&
      train.destination.toLowerCase() === to.toLowerCase()
  );

  res.render("trains/results", {
    matchedTrains,
    details: {
      from,
      to,
      travelClass,
      passengers,
      type,
      date,
      via,
    },
  });
});

module.exports = router;

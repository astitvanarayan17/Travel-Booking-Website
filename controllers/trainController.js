const Train = require("../models/train");

// Show all trains (used for /trains)
module.exports.index = async (req, res) => {
    const trains = await Train.find({});
    res.render("trains/index", { trains });
};

// Show form to add new train
module.exports.newTrainForm = (req, res) => {
    res.render("trains/new");
};

// Create a new train
module.exports.createTrain = async (req, res) => {
    const train = new Train(req.body.train);
    await train.save();
    res.redirect("/trains");
};

// Show single train by ID
module.exports.showTrain = async (req, res) => {
    const { id } = req.params;
    const train = await Train.findById(id);
    res.render("trains/show", { train });
};

// Book a seat on a train by ID
module.exports.bookSeat = async (req, res) => {
    const { id } = req.params;
    const train = await Train.findById(id);
    if (train.seatsAvailable > 0) {
        train.seatsAvailable -= 1;
        await train.save();
        res.redirect(`/trains/${id}`);
    } else {
        res.send("No seats available");
    }
};

// NEW: Handle filtered search by query parameters
module.exports.searchTrains = async (req, res) => {
    const { source, destination, travelClass, date, passengers } = req.query;

    // Optional: validate query parameters here

    const trains = await Train.find({
        source: { $regex: new RegExp(source, "i") },
        destination: { $regex: new RegExp(destination, "i") },
        class: travelClass,
    });

    res.render("trains/result", {
        matchedTrains: trains,
        source,
        destination,
        travelClass,
        date,
        passengers,
    });
};

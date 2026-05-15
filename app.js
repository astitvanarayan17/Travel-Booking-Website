require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// MongoDB Connection
const dbUrl = process.env.dbURL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flightDB";
mongoose.connect(dbUrl)
.then(() => {
    console.log("✅ MongoDB connected successfully");
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
});

const flightRoutes = require("./routes/flight");
const authRoutes = require("./routes/auth");
const trainRoutes = require("./routes/trains");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.seshSECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    // Add helper functions to res.locals
    const { getCity } = require("./utils/helperFunctions");
    res.locals.getCity = getCity;
    next();
});

// Mount routes
app.use("/", flightRoutes);
app.use("/trains", trainRoutes);
app.use("/", authRoutes);

// 404 page
app.all("*", (req, res) => {
    res.status(404).send("Page Not Found");
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

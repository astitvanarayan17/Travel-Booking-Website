const _ = require("lodash");
const User = require("../models/user");


module.exports.renderRegister = (req, res) => {
    res.render("auth/register");
}

module.exports.register = async (req, res, next) => {
    try {
        let { name, email, password } = req.body;
        name = _.startCase(_.camelCase(name));
        email = email.trim().toLowerCase();
        const user = new User({ name, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect("/login");
        });
    } catch (e) {
        if (e.name === "MissingUsernameError") {
            req.flash("error", "Please enter your email address.");
        } else {
            req.flash("error", e.message);
        }
        res.redirect("/register");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("auth/login");
}

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || "/";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/");
    });
};

const passport = require("passport");

//Schema requirement
const User = require("../models/user");

//Register user
module.exports.regUser = async (req, res, next) => {
	try {
		res.render("users/register");
	} catch (err) {
		next(err);
	}
};

module.exports.regUserPost = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const regUser = await User.register(user, password);
		//Passport login syntax
		req.login(user, function (err) {
			if (err) {
				return next(err);
			}
			req.flash("success", "Welcome to Yelp Camp");
			res.redirect("/campgrounds");
		});
	} catch (error) {
		req.flash("error", error.message);
		res.redirect("/register");
	}
};

//Login User
module.exports.loginUser = async (req, res, next) => {
	try {
		res.render("users/login");
	} catch (err) {
		next(err);
	}
};

module.exports.loginUserPost = (req, res) => {
	const redirectURL = req.session.returnTo || "/campgrounds";
	req.flash("success", "Welcome to Yelp Camp");
	delete req.session.returnTo;
	res.redirect(redirectURL);
};

//Logout User
module.exports.logoutUser = (req, res) => {
	req.logout();
	req.flash("success", "Successfully logged out.");
	res.redirect("/campgrounds");
};

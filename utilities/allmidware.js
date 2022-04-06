//Joi validation schema
const { validateSchema, reviewSchema } = require("./Joischema");
//Error handler
const expressError = require("./expressError");
//Campground Schema
const Campground = require("../models/campground");
const Review = require("../models/review");

//Login middleware setup
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be signed in.");
		return res.redirect("/login");
	}
	next();
};

//Campground validation middleware setup
module.exports.validateCampground = (req, res, next) => {
	const { error } = validateSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((e) => e.message).join(",");
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

//Review validation middleware setup
module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((e) => e.message).join(",");
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

//Author middleware setup
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	if (!camp.author.equals(req.user._id)) {
		req.flash("error", "Permission denied.");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};
//Review author middleware setup
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "Permission denied.");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

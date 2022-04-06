//Schemas requirement
const Campground = require("../models/campground");
const Review = require("../models/review");

//Add a review
module.exports.add = async (req, res, next) => {
	try {
		const idCampground = await Campground.findById(req.params.id);
		const newReview = new Review(req.body.review);
		newReview.author = req.user._id;
		idCampground.reviews.push(newReview);
		await newReview.save();
		await idCampground.save();
		req.flash("success", "Review created.");
		res.redirect(`/campgrounds/${idCampground.id}`);
	} catch (error) {
		next(error);
	}
};

//Review delete
module.exports.deleteReview = async (req, res, next) => {
	try {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash("success", "Review deleted.");
		res.redirect(`/campgrounds/${id}`);
	} catch (error) {
		next(error);
	}
};

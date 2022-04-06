const express = require("express");
const router = express.Router({ mergeParams: true });

//Review controller requirement
const reviewCtrl = require("../controllers/reviews");

//Login Middlewares
const {
	isLoggedIn,
	isReviewAuthor,
	validateReview,
} = require("../utilities/allmidware");

//review add
router.post("/", isLoggedIn, validateReview, reviewCtrl.add);

//review delete
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	reviewCtrl.deleteReview
);

module.exports = router;

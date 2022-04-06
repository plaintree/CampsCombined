const express = require("express");
const router = express.Router();

//Campground controller requirement
const campgroundCtrl = require("../controllers/campgrounds");

//Async trycatch simplified module
const asyncError = require("../utilities/asyncError");

//Validate middleware requirement
const {
	isLoggedIn,
	isAuthor,
	validateCampground,
} = require("../utilities/allmidware");

//Cloudinary images storage setup
const { storage } = require("../utilities/cloudinary");

//Multer requirement (file upload)
const multer = require("multer");
const upload = multer({ storage });

//Group '/' into one
router
	.route("/")
	.get(campgroundCtrl.index) //campground index
	.post(
		isLoggedIn,
		upload.array("image"),
		validateCampground,
		campgroundCtrl.addPost
	); //new campground post

//New campground
router.get("/add", isLoggedIn, campgroundCtrl.add);

//group '/:id' into one
router
	.route("/:id")
	.get(campgroundCtrl.detail) //campground detail (must after 'new')
	//new campgrounds
	.patch(
		isLoggedIn,
		isAuthor,
		upload.array("image"),
		validateCampground,
		campgroundCtrl.editPatch
	) //Edit single campground (patch method)
	.delete(isLoggedIn, isAuthor, campgroundCtrl.deleteCamp); //delete campground

//Edit single campground
router.get("/:id/edit", isLoggedIn, isAuthor, campgroundCtrl.edit);

module.exports = router;

//Campground schema requirement
const Campground = require("../models/campground");
const { cloudinary } = require("../utilities/cloudinary");

//Mapbox interactive mao
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

//Campground index
module.exports.index = async (req, res, next) => {
	try {
		const campground = await Campground.find({});
		res.render("campgrounds/index", { campground });
	} catch (error) {
		next(error);
	}
};

//Campground add new camp
module.exports.add = (req, res) => {
	try {
		res.render("campgrounds/add");
	} catch (error) {
		next(error);
	}
};

module.exports.addPost = async (req, res, next) => {
	try {
		const geoData = await geocoder
			.forwardGeocode({
				query: req.body.campground.location,
				limit: 1,
			})
			.send();

		const newCampground = new Campground(req.body.campground);
		newCampground.geometry = geoData.body.features[0].geometry;
		newCampground.images = req.files.map((f) => ({
			url: f.path,
			filename: f.filename,
		}));
		newCampground.author = req.user._id;
		await newCampground.save();
		console.log(newCampground);
		req.flash("success", "A new campground has been added.");
		res.redirect(`/campgrounds/${newCampground._id}`);
	} catch (e) {
		next(e);
	}
};

//Campground detail
module.exports.detail = async (req, res, next) => {
	try {
		const { id } = req.params;
		const idCampground = await Campground.findById(id)
			.populate({ path: "reviews", populate: { path: "author" } })
			.populate("author");
		if (!idCampground) {
			req.flash("error", "Campground not found.");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/detail", { idCampground });
	} catch (error) {
		next(error);
	}
};

//Edit a Campground
module.exports.edit = async (req, res, next) => {
	try {
		const { id } = req.params;
		const idCampground = await Campground.findById(id);
		if (!idCampground) {
			req.flash("error", "Campground not found.");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", { idCampground });
	} catch (error) {
		next(error);
	}
};

module.exports.editPatch = async (req, res, next) => {
	try {
		const { id } = req.params;
		const editCampground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		const imgs = req.files.map((f) => ({
			url: f.path,
			filename: f.filename,
		}));
		editCampground.images.push(...imgs);
		if (req.body.deleteImages) {
			for (let filename of req.body.deleteImages) {
				await cloudinary.uploader.destroy(filename);
			}
			await editCampground.updateOne({
				$pull: { images: { filename: { $in: req.body.deleteImages } } },
			});
		}
		await editCampground.save();
		console.log(editCampground);
		req.flash("success", "Campground updated.");
		res.redirect(`/campgrounds/${editCampground._id}`);
	} catch (error) {
		next(error);
	}
};

//Campground deleted
module.exports.deleteCamp = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash("success", "Campground deleted.");
		res.redirect("/campgrounds");
	} catch (error) {
		next(error);
	}
};

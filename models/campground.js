const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
// include virtuals in res.json()
const opts = { toJSON: { virtuals: true } };

const imgSchema = new Schema({
	url: String,
	filename: String,
});
// Cloudinary image into thumbnail
imgSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/c_thumb,w_200,g_face");
});

const campgroundSchema = new Schema(
	{
		title: String,
		images: [imgSchema],
		geometry: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		description: String,
		location: String,
		author: { type: Schema.Types.ObjectId, ref: "User" },
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review",
			},
		],
	},
	opts
);

// Setting up for mapbox popup
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
	return `<a href="/campgrounds/${
		this._id
	}">${this.title}</a><hr><p>${this.description.substring(0, 20)}...</p>
	`;
});

campgroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews },
		});
	}
});

module.exports = mongoose.model("Campground", campgroundSchema);

const mongoose = require("mongoose");
const fs = require("fs");
const cities = require("./cities.json");
const descriptors = require("./descriptors.json");
const places = require("./places.json");
const Campground = require("../models/campground");

async function main() {
	try {
		await mongoose.connect("mongodb://localhost:27017/yelpCamp");
		console.log("Mongo connected.");
	} catch {
		(err) => console.log(err);
	}
}
main();

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDb = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const rand1000 = Math.floor(Math.random() * 1000);

		const camp = new Campground({
			author: "624311edd6438ff39929b956",
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${cities[rand1000].city}, ${cities[rand1000].admin_name}`,
			price: Math.floor(Math.random() * 100),
			geometry: {
				type: "Point",
				coordinates: [cities[rand1000].lng, cities[rand1000].lat],
			},
			images: [
				{
					url: "https://res.cloudinary.com/plaintree/image/upload/v1648818421/Yelp-Camp/ipyuwvfhe3fqge6y1zxx.jpg",
					filename: "Yelp-Camp/ipyuwvfhe3fqge6y1zxx",
				},
			],
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		});
		await camp.save();
	}
};
seedDb().then(() => {
	mongoose.connection.close();
});

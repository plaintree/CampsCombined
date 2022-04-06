//Development mode turn env on
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const methodOverride = require("method-override");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const engine = require("ejs-mate");
const mongoose = require("mongoose");
//Sanitize the received data, and remove any offending keys, or replace the characters with a 'safe' one
const mongoSanitize = require("express-mongo-sanitize");
//secure your Express apps by setting various HTTP headers
const helmet = require("helmet");

//Configuring session
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

//Passport authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Custom requirement
const expressError = require("./utilities/expressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const User = require("./models/user");
const userRoutes = require("./routes/users");

const uri = process.env.MONGODB_URL || "mongodb://localhost:27017/yelpCamp";
//Mongoose server connection
async function main() {
	try {
		await mongoose.connect(uri);
		console.log("Mongoose mongodb connected.");
	} catch {
		(err) => console.log(err);
	}
}
main();
//File directory with ejs
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
//Parse URL link with override
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//Static file dir to CSS, image
app.use(express.static(path.join(__dirname, "public")));
//To remove data using these defaults
app.use(mongoSanitize());

//Helmat config
// app.use(helmet({ contentSecurityPolicy: false }));
const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
	"https://api.tiles.mapbox.com/",
	"https://api.mapbox.com/",
	"https://kit.fontawesome.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net/",
	"https://res.cloudinary.com/dv5vm4sqh/",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	"https://stackpath.bootstrapcdn.com/",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
	"https://cdn.jsdelivr.net/",
	"https://res.cloudinary.com/dv5vm4sqh/",
];
const connectSrcUrls = [
	"https://*.tiles.mapbox.com",
	"https://api.mapbox.com",
	"https://events.mapbox.com",
	"https://res.cloudinary.com/dv5vm4sqh/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/plaintree/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				"https://images.unsplash.com/",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
			childSrc: ["blob:"],
		},
	})
);
//Configuring session
const secret = process.env.SECRET || "notsecured";
app.use(
	session({
		name: "session",
		secret,
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: uri,
			touchAfter: 60 * 60 * 24,
		}),
		cookie: {
			//secure: true,
			httpOnly: true,
			expires: Date.now() + 1000 * 24 * 60 * 60,
			maxAge: 60 * 60 * 1000 * 24 * 7,
		},
	})
);
app.use(flash());

//Passport Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash message middleware
//Make 'success', 'error','CurrentUser' available in templates
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

//Campground routes set up
app.use("/campgrounds", campgroundRoutes);
//Review routes set up
app.use("/campgrounds/:id/reviews", reviewRoutes);
//User routes set up
app.use("/", userRoutes);

//Home index
app.get("/", (req, res) => {
	res.render("home");
});

//404 not found
app.all("*", (req, res, next) => {
	next(new expressError("Page not found", 404));
});

//Error handling
app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) {
		err.message = "Oops. Something went wrong.";
	}
	res.status(status).render("error", { err });
});

//Express port
app.listen(port, () => {
	console.log(`listening on port ${port}`);
});

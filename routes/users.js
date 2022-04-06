const express = require("express");
const router = express.Router();
const passport = require("passport");

//User controller requirement
const userCtrl = require("../controllers/users");

//User register into one router group
router.route("/register").get(userCtrl.regUser).post(userCtrl.regUserPost);

//User login into one router group
router
	.route("/login")
	.get(userCtrl.loginUser)
	.post(
		passport.authenticate("local", {
			failureFlash: true,
			failureRedirect: "/login",
		}),
		userCtrl.loginUserPost
	);

//User logout
router.get("/logout", userCtrl.logoutUser);

module.exports = router;

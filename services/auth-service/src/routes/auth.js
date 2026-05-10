const router = require("express").Router();
const authController = require("../controllers/authController");
const passport = require("passport");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false
	})
);
router.get(
	"/google/callback",
	passport.authenticate("google", {
		session: false,
		failureRedirect: "/auth/google/failure"
	}),
	authController.googleCallback
);
router.get("/google/failure", authController.googleFailure);

module.exports = router;

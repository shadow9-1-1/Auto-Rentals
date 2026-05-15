const router = require("express").Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validations/authValidation");

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
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

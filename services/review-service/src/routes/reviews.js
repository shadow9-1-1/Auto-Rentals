const router = require("express").Router();
const reviewController = require("../controllers/reviewController");

router.get("/", reviewController.listReviews);
router.post("/", reviewController.createReview);

module.exports = router;

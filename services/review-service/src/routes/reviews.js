const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const requireReviewer = require("../middlewares/requireReviewer");

router.get("/", reviewController.listReviews);
router.post("/", requireReviewer, reviewController.createReview);

module.exports = router;

const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const requireReviewer = require("../middlewares/requireReviewer");

router.get("/", reviewController.listReviews);
router.get("/stats/overview", reviewController.getReviewStats);
router.get("/admin/recalculate", reviewController.recalculateAllRatings);
router.get("/:vehicleId/rating-details", reviewController.getVehicleRatingDetails);

router.post("/", requireReviewer, reviewController.createReview);
router.put("/:reviewId", requireReviewer, reviewController.updateReview);
router.delete("/:reviewId", requireReviewer, reviewController.deleteReview);

module.exports = router;

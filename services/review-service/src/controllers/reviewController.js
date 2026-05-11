const Review = require("../models/Review");
const BookingRef = require("../models/BookingRef");

const listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ items: reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const reviewerUserId = req.user && req.user.id ? String(req.user.id) : "";
    const bookingId = String(req.body.bookingId || "").trim();
    const vehicleId = String(req.body.vehicleId || "").trim();
    const rating = Number(req.body.rating);

    if (!reviewerUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    if (!vehicleId) {
      return res.status(400).json({ error: "vehicleId is required" });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    const booking = await BookingRef.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (String(booking.renter && booking.renter.userId) !== reviewerUserId) {
      return res.status(403).json({ error: "You can only review your own bookings" });
    }

    if (String(booking.vehicle && booking.vehicle.vehicleId) !== vehicleId) {
      return res.status(400).json({ error: "vehicleId does not match booking" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ error: "Only completed bookings can be reviewed" });
    }

    const duplicate = await Review.findOne({ bookingId, "reviewer.userId": reviewerUserId });
    if (duplicate) {
      return res.status(409).json({ error: "Review already exists for this booking" });
    }

    const reviewPayload = {
      reviewer: {
        userId: reviewerUserId,
        displayName: req.body.reviewer && req.body.reviewer.displayName,
        avatarUrl: req.body.reviewer && req.body.reviewer.avatarUrl
      },
      bookingId,
      vehicleId,
      rating,
      title: req.body.title,
      comment: req.body.comment
    };

    const review = await Review.create(reviewPayload);
    res.status(201).json({ item: review });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: "Review already exists for this booking" });
    }
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const reviewerUserId = req.user && req.user.id ? String(req.user.id) : "";
    const reviewId = String(req.params.reviewId || "").trim();

    if (!reviewerUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Verify ownership: only the reviewer can edit their review
    if (String(review.reviewer && review.reviewer.userId) !== reviewerUserId) {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }

    // Update allowed fields
    const updates = {};

    if (req.body.title !== undefined) {
      updates.title = String(req.body.title).trim();
    }

    if (req.body.comment !== undefined) {
      updates.comment = String(req.body.comment).trim();
    }

    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "rating must be between 1 and 5" });
      }
      updates.rating = rating;
    }

    // Apply updates
    Object.assign(review, updates);
    const updatedReview = await review.save();

    res.status(200).json({ item: updatedReview });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const reviewerUserId = req.user && req.user.id ? String(req.user.id) : "";
    const reviewId = String(req.params.reviewId || "").trim();

    if (!reviewerUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Verify ownership: only the reviewer can delete their review
    if (String(review.reviewer && review.reviewer.userId) !== reviewerUserId) {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    await Review.deleteOne({ _id: reviewId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listReviews,
  createReview,
  updateReview,
  deleteReview
};

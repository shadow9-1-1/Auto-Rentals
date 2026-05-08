const Review = require("../models/Review");

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
    const review = await Review.create(req.body);
    res.status(201).json({ item: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listReviews,
  createReview
};

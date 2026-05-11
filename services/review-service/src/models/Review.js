const mongoose = require("mongoose");

const reviewerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    displayName: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: reviewerSchema,
      required: true
    },
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    bookingId: {
      type: String,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true
    },
    comment: {
      type: String,
      trim: true
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    flaggedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

reviewSchema.index({ bookingId: 1, "reviewer.userId": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);

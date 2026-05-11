const mongoose = require("mongoose");
const { getVehicleDbConnection } = require("../config/vehicleDatabase");

// Schema definition (minimal, only for rating operations)
const vehicleRatingSchema = new mongoose.Schema(
  {
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: 0
      },
      ratingDistribution: {
        five: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
        two: { type: Number, default: 0 },
        one: { type: Number, default: 0 }
      },
      lastUpdated: {
        type: Date,
        default: () => new Date()
      }
    }
  },
  { strict: false } // Allow any fields, we only care about ratings
);

let VehicleRating = null;

const getVehicleRatingModel = async () => {
  if (VehicleRating) {
    return VehicleRating;
  }

  try {
    const connection = await getVehicleDbConnection();
    VehicleRating = connection.model("Vehicle", vehicleRatingSchema);
    return VehicleRating;
  } catch (error) {
    console.error("Failed to get Vehicle Rating model:", error);
    throw error;
  }
};

module.exports = {
  getVehicleRatingModel
};

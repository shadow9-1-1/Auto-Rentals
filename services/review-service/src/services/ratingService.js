const Review = require("../models/Review");
const { getVehicleRatingModel } = require("../models/VehicleRating");

/**
 * Optimized aggregation pipeline to calculate vehicle rating statistics
 * Uses MongoDB aggregation for efficient computation on large datasets
 */
const aggregateVehicleRatings = async (vehicleId) => {
  try {
    const results = await Review.aggregate([
      {
        $match: {
          vehicleId: String(vehicleId),
          isPublished: true
        }
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: "$vehicleId",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                minRating: { $min: "$rating" },
                maxRating: { $max: "$rating" }
              }
            }
          ],
          distribution: [
            {
              $group: {
                _id: "$rating",
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: -1 }
            }
          ]
        }
      }
    ]);

    if (!results || !results[0]) {
      return null;
    }

    const stats = results[0].stats[0];
    const distribution = results[0].distribution;

    // Convert distribution array to object for easier access
    const ratingDistribution = {
      five: 0,
      four: 0,
      three: 0,
      two: 0,
      one: 0
    };

    distribution.forEach((item) => {
      const rating = item._id;
      const count = item.count;
      if (rating === 5) ratingDistribution.five = count;
      else if (rating === 4) ratingDistribution.four = count;
      else if (rating === 3) ratingDistribution.three = count;
      else if (rating === 2) ratingDistribution.two = count;
      else if (rating === 1) ratingDistribution.one = count;
    });

    return {
      averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0,
      totalReviews: stats.totalReviews || 0,
      minRating: stats.minReview || null,
      maxRating: stats.maxRating || null,
      ratingDistribution,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error("Rating aggregation error:", error);
    return null;
  }
};

/**
 * Update vehicle ratings in the vehicle database
 * Called whenever a review is created, updated, or deleted
 */
const updateVehicleRating = async (vehicleId) => {
  try {
    const Vehicle = await getVehicleRatingModel();
    const ratingStats = await aggregateVehicleRatings(vehicleId);

    if (!ratingStats) {
      // If no reviews, reset ratings to default
      await Vehicle.findByIdAndUpdate(
        vehicleId,
        {
          $set: {
            "ratings.averageRating": 0,
            "ratings.totalReviews": 0,
            "ratings.ratingDistribution": {
              five: 0,
              four: 0,
              three: 0,
              two: 0,
              one: 0
            },
            "ratings.lastUpdated": new Date()
          }
        },
        { new: true }
      );
      return null;
    }

    const updated = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        $set: {
          "ratings.averageRating": ratingStats.averageRating,
          "ratings.totalReviews": ratingStats.totalReviews,
          "ratings.ratingDistribution": ratingStats.ratingDistribution,
          "ratings.lastUpdated": ratingStats.lastUpdated
        }
      },
      { new: true }
    );

    return updated ? updated.ratings : null;
  } catch (error) {
    console.error("Update vehicle rating error:", error);
    throw error;
  }
};

/**
 * Get ratings for a vehicle with detailed statistics
 */
const getVehicleRatings = async (vehicleId) => {
  try {
    const Vehicle = await getVehicleRatingModel();
    const vehicle = await Vehicle.findById(vehicleId).select("ratings").lean();
    if (!vehicle) {
      return null;
    }
    return vehicle.ratings || null;
  } catch (error) {
    console.error("Get vehicle ratings error:", error);
    return null;
  }
};

/**
 * Get multiple vehicles with their ratings (batch operation)
 */
const getMultipleVehiclesRatings = async (vehicleIds) => {
  try {
    const Vehicle = await getVehicleRatingModel();
    const vehicles = await Vehicle.find(
      { _id: { $in: vehicleIds } },
      "ratings"
    ).lean();

    const ratingMap = {};
    vehicles.forEach((vehicle) => {
      ratingMap[vehicle._id] = vehicle.ratings || null;
    });

    return ratingMap;
  } catch (error) {
    console.error("Get multiple vehicles ratings error:", error);
    return {};
  }
};

/**
 * Recalculate ratings for all vehicles (batch operation)
 * Use for data cleanup or migrations
 */
const recalculateAllVehicleRatings = async () => {
  try {
    const Vehicle = await getVehicleRatingModel();
    const vehicles = await Vehicle.find({}).select("_id").lean();
    const results = [];

    for (const vehicle of vehicles) {
      try {
        const updated = await updateVehicleRating(vehicle._id);
        results.push({
          vehicleId: vehicle._id,
          success: !!updated,
          ratings: updated
        });
      } catch (err) {
        results.push({
          vehicleId: vehicle._id,
          success: false,
          error: err.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Recalculate all ratings error:", error);
    throw error;
  }
};

/**
 * Get top-rated vehicles (for leaderboard/recommendations)
 */
const getTopRatedVehicles = async (limit = 10, minReviews = 5) => {
  try {
    const Vehicle = await getVehicleRatingModel();
    const vehicles = await Vehicle.find({
      "ratings.totalReviews": { $gte: minReviews }
    })
      .select("_id ratings createdAt")
      .sort({ "ratings.averageRating": -1 })
      .limit(limit)
      .lean();

    return vehicles;
  } catch (error) {
    console.error("Get top-rated vehicles error:", error);
    return [];
  }
};

module.exports = {
  aggregateVehicleRatings,
  updateVehicleRating,
  getVehicleRatings,
  getMultipleVehiclesRatings,
  recalculateAllVehicleRatings,
  getTopRatedVehicles
};

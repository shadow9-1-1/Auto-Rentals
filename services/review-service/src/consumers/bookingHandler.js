const Review = require("../models/Review");
const { redisClient } = require("../config/redis");

const invalidateReviewCache = async (vehicleId = null) => {
  try {
    if (redisClient.isOpen) {
      if (vehicleId) {
        await redisClient.del(`review:vehicle:${vehicleId}`);
      }
      const keys = await redisClient.sMembers("review:cache_keys");
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
      await redisClient.del("review:cache_keys");
    }
  } catch (err) {
    console.error("Redis invalidation error:", err);
  }
};

const handleBookingEvent = async (message) => {
  try {
    const payload = JSON.parse(message.value.toString());
    const { type, data } = payload;

    if (type === "booking.created") {
      // In a real system, we might want to pre-populate some data or check validity
      // For now, we just log it or ensure we can reference it if needed.
      console.log(`[KafkaConsumer] Booking created event received for booking ${data.id}`);
    }
  } catch (error) {
    console.error("Error processing booking event in review-service:", error);
  }
};

module.exports = {
  handleBookingEvent
};

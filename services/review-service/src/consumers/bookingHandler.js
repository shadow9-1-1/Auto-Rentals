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

const DeadLetterEvent = require("../models/DeadLetterEvent");

const handleBookingEvent = async (message, producer) => {
  let payload;
  try {
    payload = JSON.parse(message.value.toString());
    const { type, data } = payload;

    if (type === "booking.created") {
      // In a real system, we might want to pre-populate some data or check validity
      // For now, we just log it or ensure we can reference it if needed.
      console.log(`[KafkaConsumer] Booking created event received for booking ${data.id}`);
    }
  } catch (error) {
    console.error("Error processing booking event in review-service:", error);

    // DLQ Logic
    try {
      await DeadLetterEvent.create({
        topic: process.env.KAFKA_BOOKING_TOPIC || "booking.events",
        message: payload || message.value.toString(),
        error: error.message,
        service: "review-service"
      });

      if (producer) {
        const dlqTopic = `${process.env.KAFKA_BOOKING_TOPIC || "booking.events"}.dlq`;
        await producer.send({
          topic: dlqTopic,
          messages: [{ 
            key: message.key ? message.key.toString() : null, 
            value: message.value.toString(),
            headers: {
              ...message.headers,
              'x-dead-letter-error': error.message,
              'x-dead-letter-service': 'review-service'
            }
          }]
        });
        console.log(`[DLQ] Message published to ${dlqTopic}`);
      }
    } catch (dlqError) {
      console.error("Critical: Failed to log event to DLQ", dlqError);
    }
  }
};

module.exports = {
  handleBookingEvent
};

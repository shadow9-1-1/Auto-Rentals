const Vehicle = require("../models/Vehicle");
const { redisClient } = require("../config/redis");

const invalidateSearchCache = async (vehicleId = null) => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.sMembers("vehicle:search_keys");
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
      await redisClient.del("vehicle:search_keys");
      
      const topRatedKeys = await redisClient.sMembers("vehicle:top_rated_keys");
      if (topRatedKeys && topRatedKeys.length > 0) {
        await redisClient.del(topRatedKeys);
      }
      await redisClient.del("vehicle:top_rated_keys");

      if (vehicleId) {
        await redisClient.del(`vehicle:ratings:${vehicleId}`);
        await redisClient.del(`vehicle:${vehicleId}`);
      }
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

    if (type === "booking.created" || type === "booking.confirmed") {
      const { vehicleId, startDate, endDate } = data;
      
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        // Add availability entry to block the dates
        vehicle.availability.push({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "booked",
          reason: `Booking ${data.id}`
        });
        await vehicle.save();
        console.log(`[KafkaConsumer] Blocked dates for vehicle ${vehicleId} due to booking ${data.id}`);
        await invalidateSearchCache(vehicleId);
      }
    } else if (type === "booking.cancelled") {
      const { vehicleId, startDate, endDate } = data;
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        // Remove the blocked availability entry
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        vehicle.availability = vehicle.availability.filter(a => {
          return !(a.startDate.getTime() === start && a.endDate.getTime() === end && a.status === "booked");
        });
        
        await vehicle.save();
        console.log(`[KafkaConsumer] Unblocked dates for vehicle ${vehicleId} due to cancellation ${data.id}`);
        await invalidateSearchCache(vehicleId);
      }
    }
  } catch (error) {
    console.error("Error processing booking event in vehicle-service:", error);
    
    // DLQ Logic: Log the failure to MongoDB
    try {
      await DeadLetterEvent.create({
        topic: process.env.KAFKA_BOOKING_TOPIC || "booking.events",
        message: payload || message.value.toString(),
        error: error.message,
        service: "vehicle-service"
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
              'x-dead-letter-service': 'vehicle-service'
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

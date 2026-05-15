const Booking = require("../models/Booking");
const { redisClient } = require("../config/redis");
const { recordKafkaEvent } = require("../utils/metrics");

const invalidateBookingCache = async () => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.sMembers("booking:cache_keys");
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
      await redisClient.del("booking:cache_keys");
    }
  } catch (err) {
    console.error("Redis invalidation error:", err);
  }
};

const DeadLetterEvent = require("../models/DeadLetterEvent");

const handlePaymentEvent = async (message, producer) => {
  let payload;
  try {
    payload = JSON.parse(message.value.toString());
    const { type, data } = payload;

    if (type === "payment.success") {
      const { bookingId, amount, currency } = data;
      
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = "confirmed";
        booking.payment = {
          ...booking.payment,
          status: "paid",
          amount,
          currency,
          paidAt: new Date()
        };
        await booking.save();
        console.log(`[KafkaConsumer] Updated booking ${bookingId} to confirmed after successful payment.`);
        recordKafkaEvent(process.env.KAFKA_PAYMENT_TOPIC || "payment.events", type, "success");
        await invalidateBookingCache();
      }
    } else if (type === "payment.failed") {
      const { bookingId, reason } = data;
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.payment = {
          ...booking.payment,
          status: "failed"
        };
        await booking.save();
        console.log(`[KafkaConsumer] Marked payment as failed for booking ${bookingId}. Reason: ${reason}`);
        recordKafkaEvent(process.env.KAFKA_PAYMENT_TOPIC || "payment.events", type, "success");
        await invalidateBookingCache();
      }
    }
  } catch (error) {
    console.error("Error processing payment event in booking-service:", error);
    
    // DLQ Logic: Log the failure to MongoDB for manual intervention or auto-retry
    try {
      await DeadLetterEvent.create({
        topic: process.env.KAFKA_PAYMENT_TOPIC || "payment.events",
        message: payload || message.value.toString(),
        error: error.message,
        service: "booking-service"
      });

      // Optionally publish to a real Kafka DLQ topic if configured
      if (producer) {
        const dlqTopic = `${process.env.KAFKA_PAYMENT_TOPIC || "payment.events"}.dlq`;
        await producer.send({
          topic: dlqTopic,
          messages: [{ 
            key: message.key ? message.key.toString() : null, 
            value: message.value.toString(),
            headers: {
              ...message.headers,
              'x-dead-letter-error': error.message,
              'x-dead-letter-service': 'booking-service'
            }
          }]
        });
        console.log(`[DLQ] Message published to ${dlqTopic}`);
      }
    } catch (dlqError) {
      console.error("Critical: Failed to log event to DLQ", dlqError);
    }
    recordKafkaEvent(process.env.KAFKA_PAYMENT_TOPIC || "payment.events", payload?.type || "unknown", "failed");
  }
};

module.exports = {
  handlePaymentEvent
};

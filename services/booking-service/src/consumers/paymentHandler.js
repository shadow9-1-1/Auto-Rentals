const Booking = require("../models/Booking");
const { redisClient } = require("../config/redis");

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

const handlePaymentEvent = async (message) => {
  try {
    const payload = JSON.parse(message.value.toString());
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
        // Optionally update booking status to cancelled or pending retry
        // booking.status = "cancelled"; 
        await booking.save();
        console.log(`[KafkaConsumer] Marked payment as failed for booking ${bookingId}. Reason: ${reason}`);
        await invalidateBookingCache();
      }
    }
  } catch (error) {
    console.error("Error processing payment event in booking-service:", error);
  }
};

module.exports = {
  handlePaymentEvent
};

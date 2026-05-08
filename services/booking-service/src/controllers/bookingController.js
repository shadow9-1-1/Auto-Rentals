const Booking = require("../models/Booking");

const listBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ items: bookings });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);

    const producer = req.app.locals.kafkaProducer;
    if (producer) {
      const topic = process.env.KAFKA_BOOKING_TOPIC || "booking.events";
      const payload = {
        type: "booking.created",
        data: {
          id: booking._id.toString(),
          userId: booking.userId,
          vehicleId: booking.vehicleId,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
          pricing: booking.pricing
        }
      };

      try {
        await producer.send({
          topic,
          messages: [{ key: booking._id.toString(), value: JSON.stringify(payload) }]
        });
      } catch (error) {
        console.error("Failed to publish booking event", error);
      }
    }

    res.status(201).json({ item: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookings,
  createBooking
};

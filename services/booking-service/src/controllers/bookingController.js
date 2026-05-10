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
    const { vehicle, startDate, endDate, renter } = req.body;
    
    // Automatically set renter.userId if req.user is populated
    if (req.user) {
      req.body.renter = {
        ...renter,
        userId: req.user.id
      };
    }

    if (!vehicle || !vehicle.vehicleId) {
      return res.status(400).json({ error: "Vehicle information with vehicleId is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (start >= end) {
      return res.status(400).json({ error: "endDate must be after startDate" });
    }

    // Prevent overlaps: double booking prevented
    const conflict = await Booking.findOne({
      "vehicle.vehicleId": vehicle.vehicleId,
      status: { $nin: ["cancelled", "expired"] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });

    if (conflict) {
      return res.status(409).json({ error: "Vehicle is already booked for the requested dates" });
    }

    const booking = await Booking.create(req.body);

    const producer = req.app.locals.kafkaProducer;
    if (producer) {
      const topic = process.env.KAFKA_BOOKING_TOPIC || "booking.events";
      const payload = {
        type: "booking.created",
        data: {
          id: booking._id.toString(),
          userId: booking.renter?.userId,
          vehicleId: booking.vehicle?.vehicleId,
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
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update. Only confirmed or cancelled are allowed." });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify ownership
    const isOwner = req.user && req.user.id === booking.renter?.userId;
    const isAdmin = req.user && req.user.roles.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to update this booking" });
    }

    if (booking.status === status) {
      return res.status(400).json({ error: `Booking is already ${status}` });
    }

    booking.status = status;
    if (status === "cancelled" && cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();

    const producer = req.app.locals.kafkaProducer;
    if (producer) {
      const topic = process.env.KAFKA_BOOKING_TOPIC || "booking.events";
      const payload = {
        type: `booking.${status}`,
        data: {
          id: booking._id.toString(),
          userId: booking.renter?.userId,
          vehicleId: booking.vehicle?.vehicleId,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
          pricing: booking.pricing,
          cancellationReason: booking.cancellationReason
        }
      };

      try {
        await producer.send({
          topic,
          messages: [{ key: booking._id.toString(), value: JSON.stringify(payload) }]
        });
      } catch (error) {
        console.error(`Failed to publish booking.${status} event`, error);
      }
    }

    res.status(200).json({ item: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookings,
  createBooking,
  updateBookingStatus
};

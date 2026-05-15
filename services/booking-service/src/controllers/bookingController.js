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

const listBookings = async (req, res, next) => {
  try {
    if (redisClient.isOpen) {
      const cached = await redisClient.get("booking:list");
      if (cached) return res.status(200).json({ items: JSON.parse(cached) });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 });

    if (redisClient.isOpen) {
      await redisClient.setEx("booking:list", 300, JSON.stringify(bookings));
      await redisClient.sAdd("booking:cache_keys", "booking:list");
    }

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

    await invalidateBookingCache();

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

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update. Only confirmed, cancelled, or completed are allowed." });
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

    await invalidateBookingCache();

    res.status(200).json({ item: booking });
  } catch (error) {
    next(error);
  }
};

const listBookingActivity = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      renterId,
      vehicleId,
      paymentStatus,
      startFrom,
      startTo,
      endFrom,
      endTo,
      createdFrom,
      createdTo,
      search,
      sortBy = "created"
    } = req.query;

    const query = {};

    if (status) {
      query.status = String(status).trim();
    }

    if (renterId) {
      query["renter.userId"] = String(renterId).trim();
    }

    if (vehicleId) {
      query["vehicle.vehicleId"] = String(vehicleId).trim();
    }

    if (paymentStatus) {
      query["payment.status"] = String(paymentStatus).trim();
    }

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      query.$or = [
        { "renter.email": regex },
        { "renter.fullName": regex },
        { "vehicle.make": regex },
        { "vehicle.model": regex }
      ];
    }

    const startRange = {};
    if (startFrom) {
      const startFromDate = new Date(startFrom);
      if (!Number.isNaN(startFromDate.getTime())) {
        startRange.$gte = startFromDate;
      }
    }
    if (startTo) {
      const startToDate = new Date(startTo);
      if (!Number.isNaN(startToDate.getTime())) {
        startRange.$lte = startToDate;
      }
    }
    if (Object.keys(startRange).length > 0) {
      query.startDate = startRange;
    }

    const endRange = {};
    if (endFrom) {
      const endFromDate = new Date(endFrom);
      if (!Number.isNaN(endFromDate.getTime())) {
        endRange.$gte = endFromDate;
      }
    }
    if (endTo) {
      const endToDate = new Date(endTo);
      if (!Number.isNaN(endToDate.getTime())) {
        endRange.$lte = endToDate;
      }
    }
    if (Object.keys(endRange).length > 0) {
      query.endDate = endRange;
    }

    const createdRange = {};
    if (createdFrom) {
      const createdFromDate = new Date(createdFrom);
      if (!Number.isNaN(createdFromDate.getTime())) {
        createdRange.$gte = createdFromDate;
      }
    }
    if (createdTo) {
      const createdToDate = new Date(createdTo);
      if (!Number.isNaN(createdToDate.getTime())) {
        createdRange.$lte = createdToDate;
      }
    }
    if (Object.keys(createdRange).length > 0) {
      query.createdAt = createdRange;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let sortObj = { createdAt: -1 };
    if (sortBy === "start") sortObj = { startDate: -1 };
    if (sortBy === "end") sortObj = { endDate: -1 };
    if (sortBy === "status") sortObj = { status: 1, createdAt: -1 };

    const cacheKey = `booking:activity:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
    if (redisClient.isOpen) {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return res.status(200).json(JSON.parse(cachedResult));
      }
    }

    const [bookings, totalItems] = await Promise.all([
      Booking.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Booking.countDocuments(query)
    ]);

    const result = {
      items: bookings,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    };

    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
      await redisClient.sAdd("booking:cache_keys", cacheKey);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getBookingStats = async (req, res, next) => {
  try {
    if (redisClient.isOpen) {
      const cached = await redisClient.get("booking:stats");
      if (cached) return res.status(200).json(JSON.parse(cached));
    }

    const stats = await Booking.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$pricing.totalAmount" },
                averageBookingValue: { $avg: "$pricing.totalAmount" }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          paymentBreakdown: [
            {
              $group: {
                _id: "$payment.status",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          recentBookings: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                renter: 1,
                vehicle: 1,
                status: 1,
                startDate: 1,
                endDate: 1,
                createdAt: 1,
                pricing: 1
              }
            }
          ]
        }
      }
    ]);

    const overview = (stats[0] && stats[0].overview && stats[0].overview[0]) || {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0
    };

    const result = {
      overview,
      statusBreakdown: (stats[0] && stats[0].statusBreakdown) || [],
      paymentBreakdown: (stats[0] && stats[0].paymentBreakdown) || [],
      recentBookings: (stats[0] && stats[0].recentBookings) || []
    };

    if (redisClient.isOpen) {
      await redisClient.setEx("booking:stats", 300, JSON.stringify(result));
      await redisClient.sAdd("booking:cache_keys", "booking:stats");
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const cancelBookingAdmin = async (req, res, next) => {
  try {
    const bookingId = String(req.params.id || "").trim();
    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ error: "Completed bookings cannot be cancelled" });
    }

    booking.status = "cancelled";
    const reason = req.body && req.body.cancellationReason
      ? String(req.body.cancellationReason).trim()
      : "Cancelled by admin";
    booking.cancellationReason = reason;

    await booking.save();

    const producer = req.app.locals.kafkaProducer;
    if (producer) {
      const topic = process.env.KAFKA_BOOKING_TOPIC || "booking.events";
      const payload = {
        type: "booking.cancelled",
        data: {
          id: booking._id.toString(),
          userId: booking.renter?.userId,
          vehicleId: booking.vehicle?.vehicleId,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
          pricing: booking.pricing,
          cancellationReason: booking.cancellationReason,
          cancelledBy: req.user ? req.user.id : undefined
        }
      };

      try {
        await producer.send({
          topic,
          messages: [{ key: booking._id.toString(), value: JSON.stringify(payload) }]
        });
      } catch (error) {
        console.error("Failed to publish booking.cancelled event", error);
      }
    }

    await invalidateBookingCache();

    res.status(200).json({ item: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookings,
  createBooking,
  updateBookingStatus,
  listBookingActivity,
  getBookingStats,
  cancelBookingAdmin
};

const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Booking = require("../src/models/Booking");

// Mocking Redis
jest.mock("../src/config/redis", () => ({
  redisClient: {
    isOpen: true,
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue("OK"),
    sMembers: jest.fn().mockResolvedValue([]),
    del: jest.fn().mockResolvedValue(1),
    sAdd: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
  },
}));

// Mock Kafka
app.locals.kafkaProducer = {
  send: jest.fn().mockResolvedValue([{ topicName: "booking.events", partition: 0, errorCode: 0 }]),
};

describe("Booking Service Integration Tests", () => {
  let userId = new mongoose.Types.ObjectId().toString();
  let vehicleId = new mongoose.Types.ObjectId().toString();
  let userToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret";
    userToken = jwt.sign({ sub: userId, role: "renter", roles: ["renter"] }, process.env.JWT_SECRET);
    
    const url = process.env.BOOKING_MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/auto_rentals_booking_test";
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    jest.clearAllMocks();
  });

  describe("POST /bookings (Double Booking Prevention)", () => {
    it("should create a booking when there is no conflict", async () => {
      const startDate = new Date(Date.now() + 864000000).toISOString();
      const endDate = new Date(Date.now() + 950400000).toISOString();

      const bookingData = {
        vehicleId: vehicleId,
        startDate: startDate,
        endDate: endDate,
        pricing: { dailyRate: 50, totalPrice: 100 }
      };

      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData);

      if (res.statusCode !== 201) {
        console.log("Response Body on Error:", JSON.stringify(res.body, null, 2));
      }

      expect(res.statusCode).toEqual(201);
      expect(res.body.item).toHaveProperty("status", "pending");
    });

    it("should fail when dates overlap with an existing booking", async () => {
      const start = new Date(Date.now() + 864000000);
      const end = new Date(Date.now() + 1036800000);

      await Booking.create({
        renter: { userId: "another-user" },
        vehicle: { vehicleId },
        startDate: start,
        endDate: end,
        pricing: { totalAmount: 100 },
        status: "confirmed"
      });

      const overlappingData = {
        vehicleId: vehicleId,
        startDate: new Date(Date.now() + 950400000).toISOString(),
        endDate: new Date(Date.now() + 1123200000).toISOString(),
        pricing: { dailyRate: 50, totalPrice: 50 }
      };

      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(overlappingData);

      expect(res.statusCode).toEqual(409);
    });
  });

  describe("PATCH /bookings/:id/status (Cancellation)", () => {
    it("should allow a renter to cancel their own booking", async () => {
      const booking = await Booking.create({
        renter: { userId },
        vehicle: { vehicleId, make: "Test", model: "Car" },
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        pricing: { totalAmount: 100 },
        status: "pending"
      });

      const res = await request(app)
        .patch(`/bookings/${booking._id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "cancelled" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.item.status).toEqual("cancelled");
    });
  });
});

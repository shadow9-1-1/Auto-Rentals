const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Vehicle = require("../src/models/Vehicle");
const { redisClient } = require("../src/config/redis");

// Mocking Redis
jest.mock("../src/config/redis", () => {
  const mRedis = {
    connect: jest.fn().mockResolvedValue(true),
    isOpen: true,
    sMembers: jest.fn().mockResolvedValue([]),
    del: jest.fn().mockResolvedValue(1),
    setEx: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
    on: jest.fn(),
  };
  return { redisClient: mRedis, connectRedis: jest.fn() };
});

describe("Vehicle Service Integration Tests", () => {
  let ownerId = new mongoose.Types.ObjectId().toString();
  let ownerToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret";
    ownerToken = jwt.sign({ sub: ownerId, role: "owner", roles: ["owner"] }, process.env.JWT_SECRET);
    
    const url = process.env.VEHICLE_MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/auto_rentals_vehicle_test";
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await Vehicle.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    jest.clearAllMocks();
  });

  describe("POST /vehicles", () => {
    it("should create a new vehicle successfully and invalidate cache", async () => {
      const vehicleData = {
        type: "sedan",
        make: "Toyota",
        model: "Camry",
        year: 2022,
        pricing: { perDay: 50 },
        location: {
          coordinates: { coordinates: [100.0, 10.0] }
        }
      };

      const res = await request(app)
        .post("/vehicles")
        .set("Authorization", `Bearer ${ownerToken}`)
        .field("type", vehicleData.type)
        .field("make", vehicleData.make)
        .field("model", vehicleData.model)
        .field("year", vehicleData.year)
        .field("pricing", JSON.stringify(vehicleData.pricing))
        .field("location", JSON.stringify(vehicleData.location));

      expect(res.statusCode).toEqual(201);
      expect(res.body.item).toHaveProperty("make", "Toyota"); // Fixed from res.body.vehicle to res.body.item
      expect(redisClient.del).toHaveBeenCalledWith("vehicle:search_keys");
    });
  });

  describe("GET /vehicles/:id", () => {
    it("should fetch a vehicle by ID", async () => {
      const vehicle = await Vehicle.create({
        ownerId: ownerId,
        type: "suv",
        make: "Honda",
        model: "CR-V",
        year: 2021,
        pricing: { perDay: 60 },
        location: { coordinates: { coordinates: [0, 0] } },
        moderation: { status: "approved" }
      });

      const res = await request(app).get(`/vehicles/${vehicle._id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.item.model).toEqual("CR-V");
    });
  });

  describe("PUT /vehicles/:id", () => {
    it("should update a vehicle and invalidate cache", async () => {
      const vehicle = await Vehicle.create({
        ownerId: ownerId,
        type: "suv",
        make: "Honda",
        model: "CR-V",
        year: 2021,
        pricing: { perDay: 60 },
        location: { coordinates: { coordinates: [0, 0] } }
      });

      // Mongoose update validators for nested objects require the whole object if you pass it like this, 
      // or specific path updates. In the controller it does { $set: updates }.
      // If we send { pricing: { perDay: 70 } }, it might replace the whole pricing subdoc if not careful.
      // But the error was "pricing.perDay: Path pricing.perDay is required" because of runValidators: true
      // and potentially how the mock/data is being sent.

      const res = await request(app)
        .put(`/vehicles/${vehicle._id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .field("model", "CR-V Hybrid")
        .field("pricing.perDay", 70);

      expect(res.statusCode).toEqual(200);
      expect(res.body.item.model).toEqual("CR-V Hybrid");
      expect(redisClient.del).toHaveBeenCalledWith(`vehicle:${vehicle._id}`);
      expect(redisClient.del).toHaveBeenCalledWith("vehicle:search_keys");
    });
  });

  describe("DELETE /vehicles/:id", () => {
    it("should soft delete a vehicle and invalidate cache", async () => {
      const vehicle = await Vehicle.create({
        ownerId: ownerId,
        type: "suv",
        make: "Honda",
        model: "CR-V",
        year: 2021,
        pricing: { perDay: 60 },
        location: { coordinates: { coordinates: [0, 0] } },
        status: "available"
      });

      const res = await request(app)
        .delete(`/vehicles/${vehicle._id}`)
        .set("Authorization", `Bearer ${ownerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toContain("soft deleted");
      
      const found = await Vehicle.findById(vehicle._id);
      expect(found.status).toEqual("unavailable");
    });
  });
});

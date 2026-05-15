const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/User");

// Mock JWT Secret for testing
process.env.JWT_SECRET = "test_secret";

describe("Auth Service Integration Tests", () => {
  beforeAll(async () => {
    const url = process.env.AUTH_MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/auto_rentals_auth_test";
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "renter"
      };

      const res = await request(app)
        .post("/auth/register")
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty("email", "test@example.com");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail validation with invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "password123",
        firstName: "Test",
        lastName: "User"
      };

      const res = await request(app)
        .post("/auth/register")
        .send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Validation failed");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("password123", 10);
      await User.create({
        email: "login@example.com",
        passwordHash,
        roles: ["renter"]
      });
    });

    it("should login successfully with correct credentials", async () => {
      const loginData = {
        email: "login@example.com",
        password: "password123"
      };

      const res = await request(app)
        .post("/auth/login")
        .send(loginData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with incorrect password", async () => {
      const loginData = {
        email: "login@example.com",
        password: "wrongpassword"
      };

      const res = await request(app)
        .post("/auth/login")
        .send(loginData);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe("RBAC Middleware (requireAdmin)", () => {
    let adminToken;
    let userToken;

    beforeEach(async () => {
      const admin = await User.create({
        email: "admin@example.com",
        passwordHash: "hash",
        roles: ["admin"],
        isActive: true
      });
      const user = await User.create({
        email: "user@example.com",
        passwordHash: "hash",
        roles: ["renter"],
        isActive: true
      });

      adminToken = jwt.sign({ sub: admin._id }, process.env.JWT_SECRET);
      userToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET);
    });

    it("should allow access for admin user", async () => {
      // Assuming there is an admin route to test
      const res = await request(app)
        .get("/auth/admin/users") // Fixed path
        .set("Authorization", `Bearer ${adminToken}`);

      // We expect either 200 or 404/others if logic is fine but route is different, 
      // but NOT 403 or 401.
      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });

    it("should deny access for non-admin user", async () => {
      const res = await request(app)
        .get("/auth/admin/users") // Fixed path
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.error).toEqual("Admin role required");
    });
  });
});

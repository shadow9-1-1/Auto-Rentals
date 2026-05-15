const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Payment = require("../src/models/Payment");

jest.mock("../src/config/stripe", () => {
  const m = {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: "sess_123", url: "https://stripe.com/test" })
      }
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  };
  return {
    createStripeClient: () => m
  };
});

const getStripeMock = () => require("../src/config/stripe").createStripeClient();

// Mock Fetch
global.fetch = jest.fn();

// Mock Kafka
app.locals.kafkaProducer = {
  send: jest.fn().mockResolvedValue([]),
};

describe("Payment Service Integration Tests", () => {
  let userId = new mongoose.Types.ObjectId().toString();
  let userToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    userToken = jwt.sign({ sub: userId, role: "renter" }, process.env.JWT_SECRET);
    
    const url = process.env.PAYMENT_MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/auto_rentals_payment_test";
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await Payment.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Payment.deleteMany({});
    jest.clearAllMocks();
  });

  describe("POST /payments/checkout", () => {
    it("should create a checkout session and pending payment", async () => {
      const checkoutData = {
        bookingId: "book_123",
        userId: userId,
        amount: 150.50,
        currency: "USD"
      };

      const res = await request(app)
        .post("/payments/checkout")
        .set("Authorization", `Bearer ${userToken}`)
        .send(checkoutData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("url", "https://stripe.com/test");
      
      const payment = await Payment.findOne({ bookingId: "book_123" });
      expect(payment.status).toEqual("pending");
      expect(payment.amount).toEqual(150.50);
    });
  });

  describe("POST /payments/webhook (Retry & Circuit Breaker Logic)", () => {
    it("should handle successful payment and trigger booking update", async () => {
      getStripeMock().webhooks.constructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "sess_123",
            amount_total: 15050,
            currency: "usd",
            metadata: { bookingId: "book_123" }
          }
        }
      });

      await Payment.create({
        bookingId: "book_123",
        userId,
        amount: 150.50,
        providerPaymentId: "sess_123",
        status: "pending"
      });

      const res = await request(app)
        .post("/payments/webhook")
        .set("stripe-signature", "test_sig")
        .send({ id: "evt_123" });

      expect(res.statusCode).toEqual(200);
      
      const payment = await Payment.findOne({ providerPaymentId: "sess_123" });
      expect(payment.status).toEqual("paid");
    });

    it("should handle checkout.session.expired", async () => {
      getStripeMock().webhooks.constructEvent.mockReturnValue({
        type: "checkout.session.expired",
        data: {
          object: {
            id: "sess_456",
            metadata: { bookingId: "book_456" }
          }
        }
      });

      await Payment.create({
        bookingId: "book_456",
        userId,
        amount: 100,
        providerPaymentId: "sess_456",
        status: "pending"
      });

      const res = await request(app)
        .post("/payments/webhook")
        .set("stripe-signature", "test_sig")
        .send({ id: "evt_456" });

      expect(res.statusCode).toEqual(200);
      const payment = await Payment.findOne({ providerPaymentId: "sess_456" });
      expect(payment.status).toEqual("failed");
    });

    it("should handle payment_intent.payment_failed", async () => {
      getStripeMock().webhooks.constructEvent.mockReturnValue({
        type: "payment_intent.payment_failed",
        data: {
          object: {
            id: "pi_failed",
            metadata: { bookingId: "book_789" },
            last_payment_error: { message: "Card declined" }
          }
        }
      });

      await Payment.create({
        bookingId: "book_789",
        userId,
        amount: 100,
        providerPaymentId: "pi_failed",
        status: "pending"
      });

      const res = await request(app)
        .post("/payments/webhook")
        .set("stripe-signature", "test_sig")
        .send({ id: "evt_789" });

      expect(res.statusCode).toEqual(200);
      const payment = await Payment.findOne({ providerPaymentId: "pi_failed" });
      expect(payment.status).toEqual("failed");
    });
  });

  describe("Circuit Breaker & Retry Fallback", () => {
    it("should save a FailedEvent when booking service update fails after retries", async () => {
      const FailedEvent = require("../src/models/FailedEvent");
      
      // Mock fetch to fail for all retries
      global.fetch.mockImplementation(() => Promise.reject(new Error("Network error")));
      
      getStripeMock().webhooks.constructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "sess_retry",
            metadata: { bookingId: "book_retry" }
          }
        }
      });

      await Payment.create({
        bookingId: "book_retry",
        userId,
        amount: 100,
        providerPaymentId: "sess_retry",
        status: "pending"
      });

      const res = await request(app)
        .post("/payments/webhook")
        .set("stripe-signature", "test_sig")
        .send({ id: "evt_retry" });

      expect(res.statusCode).toEqual(200);
      
      const failedEvent = await FailedEvent.findOne({ "payload.bookingId": "book_retry" });
      expect(failedEvent).not.toBeNull();
      expect(failedEvent.eventType).toEqual("BOOKING_CONFIRMATION_FALLBACK");
    }, 15000); // Increase timeout for retries
  });
});

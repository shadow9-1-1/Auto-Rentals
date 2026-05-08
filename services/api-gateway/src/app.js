const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");

const healthRouter = require("./routes/health");

const app = express();

const serviceUrls = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  vehicle: process.env.VEHICLE_SERVICE_URL || "http://localhost:4002",
  booking: process.env.BOOKING_SERVICE_URL || "http://localhost:4003",
  payment: process.env.PAYMENT_SERVICE_URL || "http://localhost:4004",
  review: process.env.REVIEW_SERVICE_URL || "http://localhost:4006",
  admin: process.env.ADMIN_SERVICE_URL || "http://localhost:4007"
};

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/json") && Object.keys(req.body || {}).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }
  }
  return next();
});

app.use("/health", healthRouter);

const proxyFor = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({ error: "Upstream service unavailable" });
      }
    }
  });

app.use("/auth", proxyFor(serviceUrls.auth));
app.use("/vehicles", proxyFor(serviceUrls.vehicle));
app.use("/bookings", proxyFor(serviceUrls.booking));
app.use("/payments", proxyFor(serviceUrls.payment));
app.use("/reviews", proxyFor(serviceUrls.review));
app.use("/admin", proxyFor(serviceUrls.admin));

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;

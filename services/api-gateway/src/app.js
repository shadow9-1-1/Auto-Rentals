const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");

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
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", healthRouter);

app.use(
  "/auth",
  createProxyMiddleware({ target: serviceUrls.auth, changeOrigin: true, onProxyReq: fixRequestBody })
);
app.use(
  "/vehicles",
  createProxyMiddleware({
    target: serviceUrls.vehicle,
    changeOrigin: true,
    onProxyReq: fixRequestBody
  })
);
app.use(
  "/bookings",
  createProxyMiddleware({
    target: serviceUrls.booking,
    changeOrigin: true,
    onProxyReq: fixRequestBody
  })
);
app.use(
  "/payments",
  createProxyMiddleware({
    target: serviceUrls.payment,
    changeOrigin: true,
    onProxyReq: fixRequestBody
  })
);
app.use(
  "/reviews",
  createProxyMiddleware({ target: serviceUrls.review, changeOrigin: true, onProxyReq: fixRequestBody })
);
app.use(
  "/admin",
  createProxyMiddleware({ target: serviceUrls.admin, changeOrigin: true, onProxyReq: fixRequestBody })
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;

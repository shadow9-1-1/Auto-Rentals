const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const logger = require("./utils/logger");
const { correlationMiddleware, getCorrelationId } = require("./utils/correlation");
const { metricsMiddleware } = require("./utils/metrics");

const { allowPublicRoutes, authorizeRoles, requireRolesForMethods } = require("./middlewares/auth");

const healthRouter = require("./routes/health");
const metricsRouter = require("./routes/metrics");

const app = express();

app.use(metricsMiddleware);
app.use(correlationMiddleware);

app.use((req, res, next) => {
  logger.info("Incoming gateway request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

const serviceUrls = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  vehicle: process.env.VEHICLE_SERVICE_URL || "http://localhost:4002",
  booking: process.env.BOOKING_SERVICE_URL || "http://localhost:4003",
  payment: process.env.PAYMENT_SERVICE_URL || "http://localhost:4004",
  review: process.env.REVIEW_SERVICE_URL || "http://localhost:4006",
  admin: process.env.ADMIN_SERVICE_URL || "http://localhost:4007"
};

app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-correlation-id"],
  credentials: true,
  maxAge: 86400, // 24 hours cache for preflight
};

app.use(cors(corsOptions));

// Route Stripe webhooks directly to payment-service to preserve raw body and bypass auth
app.use(
  "/payments/webhook",
  createProxyMiddleware({
    target: serviceUrls.payment,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
    on: {
      proxyReq: (proxyReq, req, res) => {
        const cid = getCorrelationId();
        if (cid) proxyReq.setHeader("x-correlation-id", cid);
      },
      error: (err, req, res) => {
        logger.error("Webhook proxy error", { error: err.message, url: req.url });
        if (!res.headersSent) {
          res.status(502).json({ error: "Upstream service unavailable" });
        }
      }
    }
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." }
});

app.use(allowPublicRoutes(["/health", "/auth", "/docs", "/metrics"]));

app.use("/auth", authLimiter);
app.use("/", limiter);

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
app.use("/metrics", metricsRouter);

const proxyFor = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
    on: {
      proxyReq: (proxyReq, req, res) => {
        const cid = getCorrelationId();
        if (cid) proxyReq.setHeader("x-correlation-id", cid);
        fixRequestBody(proxyReq, req, res);
      },
      error: (err, req, res) => {
        logger.error("Proxy error", { error: err.message, target, url: req.url });
        if (!res.headersSent) {
          res.status(502).json({ error: "Upstream service unavailable" });
        }
      }
    }
  });

app.use("/auth", proxyFor(serviceUrls.auth));
app.use(
  "/vehicles",
  requireRolesForMethods(
    {
      POST: ["owner", "admin"],
      PUT: ["owner", "admin"],
      PATCH: ["owner", "admin"],
      DELETE: ["owner", "admin"]
    },
    ["renter", "owner", "admin"]
  ),
  proxyFor(serviceUrls.vehicle)
);
app.use(
  "/bookings",
  requireRolesForMethods(
    {
      POST: ["renter", "admin"],
      PUT: ["renter", "admin"],
      PATCH: ["renter", "admin"],
      DELETE: ["renter", "admin"]
    },
    ["renter", "owner", "admin"]
  ),
  proxyFor(serviceUrls.booking)
);
app.use(
  "/payments",
  requireRolesForMethods({ POST: ["renter", "admin"] }, ["renter", "admin"]),
  proxyFor(serviceUrls.payment)
);
app.use(
  "/reviews",
  requireRolesForMethods({ POST: ["renter", "admin"] }, ["renter", "owner", "admin"]),
  proxyFor(serviceUrls.review)
);
app.use("/admin", authorizeRoles(["admin"]), proxyFor(serviceUrls.admin));

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const status = err.status || 500;
  logger.error("Gateway error", {
    error: err.message,
    stack: err.stack,
    status,
    url: req.url,
    method: req.method,
  });
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;

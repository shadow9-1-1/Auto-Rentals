const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const logger = require("./utils/logger");
const { correlationMiddleware } = require("./utils/correlation");

const healthRouter = require("./routes/health");
const metricsRouter = require("./routes/metrics");
const reviewRouter = require("./routes/reviews");

const app = express();

app.use(correlationMiddleware);

app.use((req, res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use("/health", healthRouter);
app.use("/metrics", metricsRouter);
app.use("/reviews", reviewRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  logger.error("Error encountered", {
    error: err.message,
    stack: err.stack,
    status,
    url: req.url,
    method: req.method,
  });
  res.status(status).json({
    error: err.message || "Internal server error"
  });
});

module.exports = app;

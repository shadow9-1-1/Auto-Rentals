const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const healthRouter = require("./routes/health");
const paymentRouter = require("./routes/payments");

const app = express();

app.use(helmet());
app.use(cors());

// Webhook must be parsed as raw body
const paymentController = require("./controllers/paymentController");
app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

app.use(express.json());
app.use(morgan("dev"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use("/health", healthRouter);
app.use("/payments", paymentRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error"
  });
});

module.exports = app;

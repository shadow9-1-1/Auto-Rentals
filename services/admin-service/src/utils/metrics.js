const client = require("prom-client");

// Request counter
const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status", "service"],
});

// Response time histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status", "service"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Kafka events counter
const kafkaEventsCounter = new client.Counter({
  name: "kafka_events_total",
  help: "Total number of Kafka events processed",
  labelNames: ["topic", "type", "status", "service"],
});

// Middleware to track HTTP metrics
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  const serviceName = process.env.SERVICE_NAME || "unknown-service";

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.route ? req.route.path : req.url;

    requestCounter.inc({
      method: req.method,
      route,
      status: res.statusCode,
      service: serviceName,
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route,
        status: res.statusCode,
        service: serviceName,
      },
      durationInSeconds
    );
  });

  next();
};

/**
 * Record a Kafka event metric
 */
const recordKafkaEvent = (topic, type, status) => {
  kafkaEventsCounter.inc({
    topic,
    type,
    status,
    service: process.env.SERVICE_NAME || "unknown-service",
  });
};

module.exports = {
  metricsMiddleware,
  recordKafkaEvent,
  register: client.register,
};

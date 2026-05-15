const { v4: uuidv4 } = require("uuid");
const { AsyncLocalStorage } = require("async_hooks");

const storage = new AsyncLocalStorage();

/**
 * Middleware to ensure every request has a correlation ID.
 * Generates a new one if not present in headers.
 */
const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || uuidv4();
  
  // Set in response header for debugging
  res.set("x-correlation-id", correlationId);
  
  // Store in async context
  storage.run({ correlationId }, () => {
    next();
  });
};

/**
 * Get the current correlation ID from context
 */
const getCorrelationId = () => {
  const context = storage.getStore();
  return context ? context.correlationId : null;
};

/**
 * Manually wrap a function in a correlation context.
 * Useful for Kafka consumers or background tasks.
 */
const wrapCorrelation = (correlationId, fn) => {
  return storage.run({ correlationId: correlationId || uuidv4() }, fn);
};

/**
 * Get Kafka headers containing the correlation ID
 */
const getKafkaCorrelationHeaders = () => {
  const cid = getCorrelationId();
  return cid ? { "x-correlation-id": cid } : {};
};

module.exports = {
  correlationMiddleware,
  getCorrelationId,
  wrapCorrelation,
  getKafkaCorrelationHeaders
};

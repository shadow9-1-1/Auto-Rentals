const winston = require("winston");
const { Client } = require("@opensearch-project/opensearch");
const Transport = require("winston-transport");

// Custom OpenSearch Transport
class OpenSearchTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.client = new Client({
      node: opts.node || "http://opensearch:9200",
    });
    this.index = opts.index || "logs";
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    try {
      await this.client.index({
        index: `${this.index}-${new Date().toISOString().split("T")[0]}`,
        body: {
          "@timestamp": new Date().toISOString(),
          ...info,
          service: process.env.SERVICE_NAME || "unknown-service",
        },
      });
    } catch (err) {
      console.error("Failed to ship log to OpenSearch:", err.message);
    }

    callback();
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || "unknown-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add OpenSearch transport in production or if enabled
if (process.env.NODE_ENV === "production" || process.env.ENABLE_CENTRALIZED_LOGGING === "true") {
  logger.add(
    new OpenSearchTransport({
      node: process.env.OPENSEARCH_URL || "http://opensearch:9200",
      index: "auto-rentals-logs",
    })
  );
}

module.exports = logger;

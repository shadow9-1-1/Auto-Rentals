const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const { connectProducer } = require("./config/kafka");
const { connectRedis } = require("./config/redis");

const port = process.env.BOOKING_SERVICE_PORT || process.env.PORT || 4003;

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    const producer = await connectProducer();
    app.locals.kafkaProducer = producer;

    app.listen(port, () => {
      console.log(`Booking Service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Booking Service", error);
    process.exit(1);
  }
};

startServer();

const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const { connectRedis } = require("./config/redis");

const port = process.env.VEHICLE_SERVICE_PORT || process.env.PORT || 4002;

Promise.all([connectDatabase(), connectRedis()])
  .then(async () => {
    const { connectProducer, connectConsumer } = require("./config/kafka");
    const { handleBookingEvent } = require("./consumers/bookingHandler");
    const { wrapCorrelation } = require("./utils/correlation");

    const producer = await connectProducer();
    app.locals.kafkaProducer = producer;

    const consumer = await connectConsumer();
    const BOOKING_TOPIC = process.env.KAFKA_BOOKING_TOPIC || "booking.events";

    await consumer.subscribe({ topic: BOOKING_TOPIC, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const correlationId = message.headers && message.headers["x-correlation-id"] 
          ? message.headers["x-correlation-id"].toString() 
          : null;
          
        await wrapCorrelation(correlationId, async () => {
          if (topic === BOOKING_TOPIC) {
            await handleBookingEvent(message, producer);
          }
        });
      }
    });

    app.listen(port, () => {
      console.log(`Vehicle Service listening on port ${port}`);
      console.log(`Consuming events from: ${BOOKING_TOPIC}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Vehicle Service", error);
    process.exit(1);
  });

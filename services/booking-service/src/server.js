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
    
    const { connectProducer, connectConsumer } = require("./config/kafka");
    const { handlePaymentEvent } = require("./consumers/paymentHandler");

    const producer = await connectProducer();
    app.locals.kafkaProducer = producer;

    const consumer = await connectConsumer();
    const PAYMENT_TOPIC = process.env.KAFKA_PAYMENT_TOPIC || "payment.events";
    
    await consumer.subscribe({ topic: PAYMENT_TOPIC, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (topic === PAYMENT_TOPIC) {
          await handlePaymentEvent(message);
        }
      }
    });

    app.listen(port, () => {
      console.log(`Booking Service listening on port ${port}`);
      console.log(`Consuming events from: ${PAYMENT_TOPIC}`);
    });
  } catch (error) {
    console.error("Failed to start Booking Service", error);
    process.exit(1);
  }
};

startServer();

const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const { connectConsumer, connectProducer } = require("./config/kafka");
const connectDatabase = require("./config/database");
const { startRetryWorker } = require("./workers/retryWorker");
const { handleBookingEvent, handlePaymentEvent } = require("./consumers/eventHandlers");

const port = process.env.NOTIFICATION_SERVICE_PORT || process.env.PORT || 4005;

const BOOKING_TOPIC = process.env.KAFKA_BOOKING_TOPIC || "booking.events";
const PAYMENT_TOPIC = process.env.KAFKA_PAYMENT_TOPIC || "payment.events";

const startServer = async () => {
  try {
    await connectDatabase();

    const consumer = await connectConsumer();
    app.locals.kafkaConsumer = consumer;

    const producer = await connectProducer();
    app.locals.kafkaProducer = producer;

    // Subscribe to both booking and payment event topics
    await consumer.subscribe({ topic: BOOKING_TOPIC, fromBeginning: false });
    await consumer.subscribe({ topic: PAYMENT_TOPIC, fromBeginning: false });

    // Start consuming messages and dispatch to the correct handler
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Received message from topic '${topic}' [partition ${partition}]`);
        if (topic === BOOKING_TOPIC) {
          await handleBookingEvent(message, producer);
        } else if (topic === PAYMENT_TOPIC) {
          await handlePaymentEvent(message, producer);
        }
      }
    });

    app.listen(port, () => {
      console.log(`Notification Service listening on port ${port}`);
      console.log(`Consuming events from: ${BOOKING_TOPIC}, ${PAYMENT_TOPIC}`);
      startRetryWorker(producer);
    });
  } catch (error) {
    console.error("Failed to start Notification Service", error);
    process.exit(1);
  }
};

startServer();


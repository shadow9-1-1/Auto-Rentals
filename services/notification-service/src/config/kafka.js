const { Kafka } = require("kafkajs");

const connectConsumer = async () => {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) {
    throw new Error("KAFKA_BROKERS is required");
  }

  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
    brokers: brokers.split(",").map((broker) => broker.trim())
  });

  const consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUP || "notification-service"
  });

  await consumer.connect();
  return consumer;
};

module.exports = {
  connectConsumer
};

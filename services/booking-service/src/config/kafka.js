const { Kafka } = require("kafkajs");

const connectProducer = async () => {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) {
    throw new Error("KAFKA_BROKERS is required");
  }

  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "booking-service",
    brokers: brokers.split(",").map((broker) => broker.trim())
  });

  const producer = kafka.producer();
  await producer.connect();
  return producer;
};

module.exports = {
  connectProducer
};

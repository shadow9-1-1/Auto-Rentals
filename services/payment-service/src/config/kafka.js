const { Kafka } = require("kafkajs");

const connectProducer = async () => {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) {
    console.warn("KAFKA_BROKERS is not set. Kafka producer will not be initialized.");
    return null;
  }

  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "payment-service",
    brokers: brokers.split(",").map((broker) => broker.trim())
  });

  const producer = kafka.producer();
  await producer.connect();
  console.log("Kafka producer connected in payment-service");
  return producer;
};

module.exports = {
  connectProducer
};

const { Kafka } = require("kafkajs");

const getKafkaInstance = () => {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) {
    throw new Error("KAFKA_BROKERS is required");
  }

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "review-service",
    brokers: brokers.split(",").map((broker) => broker.trim())
  });
};

const connectProducer = async () => {
  const kafka = getKafkaInstance();
  const producer = kafka.producer();
  await producer.connect();
  return producer;
};

const connectConsumer = async () => {
  const kafka = getKafkaInstance();
  const consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUP || "review-service-group"
  });
  await consumer.connect();
  return consumer;
};

module.exports = {
  connectProducer,
  connectConsumer
};

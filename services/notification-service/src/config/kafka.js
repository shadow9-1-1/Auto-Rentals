const { Kafka } = require("kafkajs");

const getKafkaInstance = () => {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) {
    throw new Error("KAFKA_BROKERS is required");
  }

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
    brokers: brokers.split(",").map((broker) => broker.trim())
  });
};

const connectConsumer = async () => {
  const kafka = getKafkaInstance();
  const consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUP || "notification-service"
  });

  await consumer.connect();
  return consumer;
};

const connectProducer = async () => {
  const kafka = getKafkaInstance();
  const producer = kafka.producer();
  await producer.connect();
  return producer;
};

module.exports = {
  connectConsumer,
  connectProducer
};

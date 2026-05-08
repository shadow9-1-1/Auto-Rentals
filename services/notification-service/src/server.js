require("dotenv").config();

const app = require("./app");
const { connectConsumer } = require("./config/kafka");

const port = process.env.PORT || 4005;

const startServer = async () => {
  try {
    const consumer = await connectConsumer();
    app.locals.kafkaConsumer = consumer;

    app.listen(port, () => {
      console.log(`Notification Service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Notification Service", error);
    process.exit(1);
  }
};

startServer();

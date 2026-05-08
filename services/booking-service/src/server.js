require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const { connectProducer } = require("./config/kafka");

const port = process.env.PORT || 4003;

const startServer = async () => {
  try {
    await connectDatabase();
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

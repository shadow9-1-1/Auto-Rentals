const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const { connectProducer } = require("./config/kafka");

const port = process.env.PAYMENT_SERVICE_PORT || process.env.PORT || 4004;

const startServer = async () => {
  try {
    await connectDatabase();
    
    const producer = await connectProducer();
    app.locals.kafkaProducer = producer;

    app.listen(port, () => {
      console.log(`Payment Service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Payment Service", error);
    process.exit(1);
  }
};

startServer();

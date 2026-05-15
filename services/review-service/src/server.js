const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const { connectRedis } = require("./config/redis");

const port = process.env.REVIEW_SERVICE_PORT || process.env.PORT || 4006;

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    app.listen(port, () => {
      console.log(`Review Service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Review Service", error);
    process.exit(1);
  }
};

startServer();

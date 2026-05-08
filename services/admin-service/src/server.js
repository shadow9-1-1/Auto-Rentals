const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.ADMIN_SERVICE_PORT || process.env.PORT || 4007;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Admin Service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Admin Service", error);
    process.exit(1);
  }
};

startServer();

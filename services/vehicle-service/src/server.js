const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.VEHICLE_SERVICE_PORT || process.env.PORT || 4002;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Vehicle Service listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 4004;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Payment Service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Payment Service", error);
    process.exit(1);
  }
};

startServer();

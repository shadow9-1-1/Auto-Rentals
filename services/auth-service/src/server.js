require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 4001;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Auth Service listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });

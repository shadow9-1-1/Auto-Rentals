const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../..", ".env") });
require("dotenv").config();

const app = require("./app");

const port = process.env.API_GATEWAY_PORT || process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});

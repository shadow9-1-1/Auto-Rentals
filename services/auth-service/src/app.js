const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const { configurePassport } = require("./config/passport");

const app = express();

configurePassport();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/health", healthRouter);
app.use("/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error"
  });
});

module.exports = app;

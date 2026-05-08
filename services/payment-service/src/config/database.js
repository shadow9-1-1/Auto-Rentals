const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.PAYMENT_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
};

module.exports = connectDatabase;

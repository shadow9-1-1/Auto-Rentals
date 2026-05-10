const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.NOTIFICATION_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("NOTIFICATION_MONGODB_URI is required");
  }

  await mongoose.connect(uri);
  console.log("Notification Service connected to MongoDB");
};

module.exports = connectDatabase;

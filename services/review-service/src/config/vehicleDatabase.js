const mongoose = require("mongoose");

let vehicleDbConnection = null;

const getVehicleDbConnection = async () => {
  if (vehicleDbConnection && vehicleDbConnection.readyState === 1) {
    return vehicleDbConnection;
  }

  try {
    const vehicleMongoDB = process.env.VEHICLE_MONGODB_URI || process.env.MONGODB_URI;
    if (!vehicleMongoDB) {
      throw new Error("VEHICLE_MONGODB_URI is not configured");
    }

    vehicleDbConnection = mongoose.createConnection(vehicleMongoDB, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10
    });

    vehicleDbConnection.on("error", (error) => {
      console.error("Vehicle DB connection error:", error);
    });

    vehicleDbConnection.on("connected", () => {
      console.log("Connected to Vehicle Database");
    });

    await vehicleDbConnection.asPromise();
    return vehicleDbConnection;
  } catch (error) {
    console.error("Failed to connect to Vehicle Database:", error);
    throw error;
  }
};

const closeVehicleDbConnection = async () => {
  if (vehicleDbConnection) {
    await vehicleDbConnection.close();
    vehicleDbConnection = null;
  }
};

module.exports = {
  getVehicleDbConnection,
  closeVehicleDbConnection
};

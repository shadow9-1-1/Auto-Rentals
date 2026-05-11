const mongoose = require("mongoose");
const { getVehicleConnection } = require("../config/analyticsDatabases");

const vehicleAnalyticsSchema = new mongoose.Schema(
  {
    ownerId: String,
    status: String,
    moderation: {
      status: String
    }
  },
  { timestamps: true, strict: false }
);

let VehicleModel = null;

const getVehicleModel = async () => {
  if (VehicleModel) {
    return VehicleModel;
  }
  const connection = await getVehicleConnection();
  VehicleModel = connection.model("Vehicle", vehicleAnalyticsSchema);
  return VehicleModel;
};

module.exports = { getVehicleModel };

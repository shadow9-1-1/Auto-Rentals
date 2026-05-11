const mongoose = require("mongoose");
const { getBookingConnection } = require("../config/analyticsDatabases");

const bookingAnalyticsSchema = new mongoose.Schema(
  {
    renter: {
      userId: String,
      email: String,
      fullName: String
    },
    vehicle: {
      vehicleId: String,
      make: String,
      model: String
    },
    startDate: Date,
    endDate: Date,
    status: String,
    cancellationReason: String,
    pricing: {
      totalAmount: Number,
      currency: String
    },
    payment: {
      status: String
    }
  },
  { timestamps: true, strict: false }
);

let BookingModel = null;

const getBookingModel = async () => {
  if (BookingModel) {
    return BookingModel;
  }
  const connection = await getBookingConnection();
  BookingModel = connection.model("Booking", bookingAnalyticsSchema);
  return BookingModel;
};

module.exports = { getBookingModel };

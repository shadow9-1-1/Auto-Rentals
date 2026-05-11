const mongoose = require("mongoose");

const { getBookingConnection } = require("../config/bookingDatabase");

const bookingRefSchema = new mongoose.Schema(
  {
    renter: {
      userId: { type: String, required: true }
    },
    vehicle: {
      vehicleId: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      required: true
    }
  },
  {
    collection: "bookings",
    strict: false
  }
);

const connection = getBookingConnection();
const BookingRef = connection.models.Booking || connection.model("Booking", bookingRefSchema);

module.exports = BookingRef;

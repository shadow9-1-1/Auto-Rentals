const mongoose = require("mongoose");

let bookingConnection;

const getBookingConnection = () => {
  if (bookingConnection) {
    return bookingConnection;
  }

  const uri = process.env.BOOKING_MONGODB_URI;
  if (!uri) {
    throw new Error("BOOKING_MONGODB_URI is required for booking validation");
  }

  bookingConnection = mongoose.createConnection(uri);
  return bookingConnection;
};

module.exports = {
  getBookingConnection
};

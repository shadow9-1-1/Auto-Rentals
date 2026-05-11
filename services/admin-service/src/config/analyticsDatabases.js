const mongoose = require("mongoose");

let bookingConnection = null;
let paymentConnection = null;
let authConnection = null;
let vehicleConnection = null;

const createConnection = async (current, uri, label) => {
  if (current && current.readyState === 1) {
    return current;
  }

  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    maxPoolSize: 10
  });

  connection.on("error", (error) => {
    console.error(`${label} DB connection error:`, error);
  });

  await connection.asPromise();
  return connection;
};

const getBookingConnection = async () => {
  const uri = process.env.BOOKING_MONGODB_URI;
  if (!uri) {
    throw new Error("BOOKING_MONGODB_URI is required for analytics");
  }
  bookingConnection = await createConnection(bookingConnection, uri, "Booking");
  return bookingConnection;
};

const getPaymentConnection = async () => {
  const uri = process.env.PAYMENT_MONGODB_URI;
  if (!uri) {
    throw new Error("PAYMENT_MONGODB_URI is required for analytics");
  }
  paymentConnection = await createConnection(paymentConnection, uri, "Payment");
  return paymentConnection;
};

const getAuthConnection = async () => {
  const uri = process.env.AUTH_MONGODB_URI;
  if (!uri) {
    throw new Error("AUTH_MONGODB_URI is required for analytics");
  }
  authConnection = await createConnection(authConnection, uri, "Auth");
  return authConnection;
};

const getVehicleConnection = async () => {
  const uri = process.env.VEHICLE_MONGODB_URI;
  if (!uri) {
    throw new Error("VEHICLE_MONGODB_URI is required for analytics");
  }
  vehicleConnection = await createConnection(vehicleConnection, uri, "Vehicle");
  return vehicleConnection;
};

module.exports = {
  getBookingConnection,
  getPaymentConnection,
  getAuthConnection,
  getVehicleConnection
};

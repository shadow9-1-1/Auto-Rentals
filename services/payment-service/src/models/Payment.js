const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "USD",
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "authorized", "paid", "failed", "refunded"],
      default: "pending"
    },
    provider: {
      type: String,
      default: "stripe",
      trim: true
    },
    providerPaymentId: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

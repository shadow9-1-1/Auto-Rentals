const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    pricing: {
      totalAmount: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: "USD",
        trim: true
      }
    }
  },
  { timestamps: true }
);

bookingSchema.path("endDate").validate({
  validator: function (value) {
    return !this.startDate || !value || value >= this.startDate;
  },
  message: "Booking endDate must be after startDate"
});

module.exports = mongoose.model("Booking", bookingSchema);

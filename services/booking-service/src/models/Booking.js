const mongoose = require("mongoose");

const renterSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    fullName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const vehicleSnapshotSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    make: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["unpaid", "authorized", "paid", "failed", "refunded"],
      default: "unpaid"
    },
    provider: {
      type: String,
      trim: true
    },
    intentId: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: "USD",
      trim: true
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    renter: {
      type: renterSchema,
      required: true
    },
    vehicle: {
      type: vehicleSnapshotSchema,
      required: true
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
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      default: "pending"
    },
    cancellationReason: {
      type: String,
      trim: true
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
    },
    payment: {
      type: paymentSchema,
      default: () => ({})
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

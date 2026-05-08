const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true
    },
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      city: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      }
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available"
    },
    features: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    availability: {
      type: [availabilitySchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);

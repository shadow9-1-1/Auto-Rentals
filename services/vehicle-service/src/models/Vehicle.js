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
    },
    status: {
      type: String,
      enum: ["available", "blocked", "booked"],
      default: "available"
    },
    reason: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

availabilitySchema.path("endDate").validate({
  validator: function (value) {
    return !this.startDate || !value || value >= this.startDate;
  },
  message: "Availability endDate must be after startDate"
});

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
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
    type: {
      type: String,
      enum: ["sedan", "suv", "truck", "van", "coupe", "convertible", "hatchback", "wagon", "other"],
      required: true
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
    pricing: {
      perDay: {
        type: Number,
        required: true,
        min: 0
      },
      perHour: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: "USD",
        trim: true
      },
      securityDeposit: {
        type: Number,
        min: 0,
        default: 0
      },
      cleaningFee: {
        type: Number,
        min: 0,
        default: 0
      },
      weeklyDiscountPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      monthlyDiscountPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    location: {
      addressLine1: {
        type: String,
        trim: true
      },
      addressLine2: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      },
      postalCode: {
        type: String,
        trim: true
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: {
          type: [Number],
          default: undefined
        }
      }
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available"
    },
    moderation: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "removed"],
        default: "pending"
      },
      reason: {
        type: String,
        trim: true
      },
      notes: {
        type: String,
        trim: true
      },
      updatedAt: {
        type: Date,
        default: () => new Date()
      },
      updatedBy: {
        type: String,
        trim: true
      },
      approvedAt: {
        type: Date
      },
      approvedBy: {
        type: String,
        trim: true
      },
      removedAt: {
        type: Date
      },
      removedBy: {
        type: String,
        trim: true
      }
    },
    features: {
      type: [String],
      default: []
    },
    images: {
      type: [imageSchema],
      default: []
    },
    availability: {
      type: [availabilitySchema],
      default: []
    },
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: 0
      },
      ratingDistribution: {
        five: {
          type: Number,
          default: 0,
          min: 0
        },
        four: {
          type: Number,
          default: 0,
          min: 0
        },
        three: {
          type: Number,
          default: 0,
          min: 0
        },
        two: {
          type: Number,
          default: 0,
          min: 0
        },
        one: {
          type: Number,
          default: 0,
          min: 0
        }
      },
      lastUpdated: {
        type: Date,
        default: () => new Date()
      }
    }
  },
  { timestamps: true }
);

vehicleSchema.index({ "location.coordinates": "2dsphere" });
vehicleSchema.index({ status: 1, type: 1 });
vehicleSchema.index({ "pricing.perDay": 1 });
vehicleSchema.index({ make: 1 });
vehicleSchema.index({ "ratings.averageRating": -1 });
vehicleSchema.index({ "ratings.totalReviews": -1 });
vehicleSchema.index({ "moderation.status": 1, updatedAt: -1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);

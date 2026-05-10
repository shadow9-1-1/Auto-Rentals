const mongoose = require("mongoose");

const failedEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true
    },
    targetUrl: {
      type: String,
      required: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    error: {
      type: String
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "failed_permanently"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FailedEvent", failedEventSchema);

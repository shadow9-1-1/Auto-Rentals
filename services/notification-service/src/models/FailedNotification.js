const mongoose = require("mongoose");

const MAX_RETRIES = 5;

const failedNotificationSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true
    },
    templateName: {
      type: String,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    error: {
      type: String
    },
    status: {
      type: String,
      enum: ["pending", "retrying", "resolved", "exhausted"],
      default: "pending",
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxRetries: {
      type: Number,
      default: MAX_RETRIES
    },
    nextRetryAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastAttemptAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FailedNotification", failedNotificationSchema);

const mongoose = require("mongoose");

const deadLetterEventSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    error: {
      type: String,
      required: true
    },
    service: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      index: true
    },
    attempts: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeadLetterEvent", deadLetterEventSchema);

const cron = require("node-cron");
const FailedNotification = require("../models/FailedNotification");
const { sendEmail } = require("../services/emailService");

// Exponential backoff: 1m, 5m, 15m, 60m, 180m
const BACKOFF_MINUTES = [1, 5, 15, 60, 180];

const getNextRetryDelay = (attempts) => {
  const index = Math.min(attempts, BACKOFF_MINUTES.length - 1);
  return BACKOFF_MINUTES[index] * 60 * 1000;
};

const processRetryQueue = async () => {
  const now = new Date();

  const pending = await FailedNotification.find({
    status: { $in: ["pending", "retrying"] },
    nextRetryAt: { $lte: now }
  }).limit(20);

  if (pending.length === 0) return;

  console.log(`[RetryQueue] Processing ${pending.length} failed notification(s)...`);

  for (const record of pending) {
    record.attempts += 1;
    record.lastAttemptAt = now;
    record.status = "retrying";
    await record.save();

    try {
      await sendEmail(record.to, record.templateName, record.data, true);

      record.status = "resolved";
      await record.save();
      console.log(`[RetryQueue] Successfully retried notification ${record._id} (${record.templateName} → ${record.to})`);
    } catch (err) {
      console.error(`[RetryQueue] Retry attempt ${record.attempts} failed for ${record._id}: ${err.message}`);

      if (record.attempts >= record.maxRetries) {
        record.status = "exhausted";
        console.error(`[RetryQueue] Notification ${record._id} exhausted all ${record.maxRetries} retries. Marked as failed permanently.`);
      } else {
        record.status = "pending";
        record.nextRetryAt = new Date(Date.now() + getNextRetryDelay(record.attempts));
        record.error = err.message;
      }

      await record.save();
    }
  }
};

const startRetryWorker = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      await processRetryQueue();
    } catch (err) {
      console.error("[RetryQueue] Worker crashed:", err);
    }
  });

  console.log("[RetryQueue] Retry worker started — polling every minute.");
};

module.exports = {
  startRetryWorker,
  processRetryQueue
};

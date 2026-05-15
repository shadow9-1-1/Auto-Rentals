const nodemailer = require("nodemailer");
const templates = require("../templates");
const FailedNotification = require("../models/FailedNotification");

// Using mailtrap for development as configured in .env
const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const SUBJECTS = {
  bookingConfirmation: "Your Booking is Confirmed!",
  paymentConfirmation: "Payment Receipt - Auto Rentals",
  paymentFailed: "Payment Failed - Action Required",
  cancellation: "Booking Cancellation Notice"
};

/**
 * Attempt to send an HTML email using a pre-built template.
 * On failure, the notification is stored in the retry queue (FailedNotification).
 * @param {string}  to           - Recipient email address
 * @param {string}  templateName - Key from src/templates/index.js
 * @param {object}  data         - Dynamic data injected into the template
 * @param {boolean} [isRetry]    - True when called from the retry worker (skip re-queuing)
 */
const sendEmail = async (to, templateName, data, isRetry = false) => {
  const templateFn = templates[templateName];
  if (!templateFn) {
    throw new Error(`Email template '${templateName}' not found.`);
  }

  const htmlContent = templateFn(data);
  const subject = SUBJECTS[templateName] || "Auto Rentals Notification";

  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM || "no-reply@auto-rentals.com",
      to,
      subject,
      html: htmlContent
    });

    console.log(`[Email] Sent '${templateName}' to ${to}`);
  } catch (error) {
    console.error(`[Email] Failed to send '${templateName}' to ${to}: ${error.message}`);

    // Queue for retry only on first attempt (not during a retry-worker run)
    if (!isRetry) {
      await FailedNotification.create({
        to,
        templateName,
        data,
        error: error.message
      });
      console.warn(`[Email] Queued for retry: ${to} / ${templateName}`);
    }

    // Re-throw so the retry worker knows the attempt failed
    throw error;
  }
};

module.exports = {
  sendEmail
};


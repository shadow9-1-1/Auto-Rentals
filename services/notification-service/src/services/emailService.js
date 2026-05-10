const nodemailer = require("nodemailer");
const templates = require("../templates");

// Using mailtrap for development as configured in .env
const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const sendEmail = async (to, templateName, data) => {
  try {
    const templateFn = templates[templateName];
    if (!templateFn) {
      throw new Error(`Email template '${templateName}' not found.`);
    }

    const htmlContent = templateFn(data);

    // Derive subject from template name or data
    let subject = "Auto Rentals Notification";
    if (templateName === "bookingConfirmation") subject = "Your Booking is Confirmed!";
    if (templateName === "paymentConfirmation") subject = "Payment Receipt - Auto Rentals";
    if (templateName === "cancellation") subject = "Booking Cancellation Notice";

    await transport.sendMail({
      from: process.env.MAIL_FROM || "no-reply@auto-rentals.com",
      to,
      subject,
      html: htmlContent
    });

    console.log(`Successfully sent '${templateName}' email to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}`, error);
  }
};

module.exports = {
  sendEmail
};

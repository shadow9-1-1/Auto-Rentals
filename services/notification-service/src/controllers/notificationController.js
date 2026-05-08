const { createMailTransport } = require("../config/mailtrap");

const transport = createMailTransport();

const sendTestEmail = async (req, res, next) => {
  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ error: "to, subject, and text are required" });
    }

    await transport.sendMail({
      from: process.env.MAIL_FROM || "no-reply@auto-rentals.test",
      to,
      subject,
      text
    });

    res.status(200).json({ status: "sent" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendTestEmail
};

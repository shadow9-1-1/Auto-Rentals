const nodemailer = require("nodemailer");

const createMailTransport = () => {
  const host = process.env.MAILTRAP_HOST;
  const port = Number(process.env.MAILTRAP_PORT || 2525);
  const user = process.env.MAILTRAP_USER;
  const pass = process.env.MAILTRAP_PASS;

  if (!host || !user || !pass) {
    throw new Error("MAILTRAP_HOST, MAILTRAP_USER, and MAILTRAP_PASS are required");
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
  });
};

module.exports = {
  createMailTransport
};

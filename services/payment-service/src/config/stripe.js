const Stripe = require("stripe");

const createStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required");
  }

  return new Stripe(secretKey, {
    apiVersion: "2024-04-10",
    typescript: false
  });
};

module.exports = {
  createStripeClient
};

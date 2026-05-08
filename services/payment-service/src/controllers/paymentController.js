const Payment = require("../models/Payment");
const { createStripeClient } = require("../config/stripe");

const stripe = createStripeClient();

const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, userId, amount, currency } = req.body;

    if (!bookingId || !userId || !amount) {
      return res.status(400).json({ error: "bookingId, userId, and amount are required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: (currency || "USD").toLowerCase(),
      metadata: {
        bookingId,
        userId
      }
    });

    const payment = await Payment.create({
      bookingId,
      userId,
      amount,
      currency: currency || "USD",
      status: "pending",
      providerPaymentId: paymentIntent.id
    });

    res.status(201).json({
      paymentId: payment._id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent
};

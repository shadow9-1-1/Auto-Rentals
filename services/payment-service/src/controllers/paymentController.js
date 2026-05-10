const jwt = require("jsonwebtoken");
const Payment = require("../models/Payment");
const { createStripeClient } = require("../config/stripe");

const stripe = createStripeClient();

const createCheckoutSession = async (req, res, next) => {
  try {
    const { bookingId, userId, amount, currency } = req.body;

    if (!bookingId || !userId || !amount) {
      return res.status(400).json({ error: "bookingId, userId, and amount are required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (currency || "USD").toLowerCase(),
            product_data: {
              name: `Booking ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: process.env.FRONTEND_SUCCESS_URL || "http://localhost:3000/success",
      cancel_url: process.env.FRONTEND_CANCEL_URL || "http://localhost:3000/cancel",
      client_reference_id: bookingId,
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
      providerPaymentId: session.id
    });

    res.status(201).json({
      paymentId: payment._id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;

    try {
      await Payment.findOneAndUpdate(
        { providerPaymentId: session.id },
        { status: "paid" }
      );

      // Inform booking-service using a signed admin JWT
      const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || "http://booking-service:4003";
      const token = jwt.sign({ sub: "system", roles: ["admin"] }, process.env.JWT_SECRET, { expiresIn: "10m" });

      await fetch(`${bookingServiceUrl}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "confirmed" })
      });

    } catch (err) {
      console.error("Failed to update payment or booking", err);
    }
  }

  res.status(200).send();
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook
};

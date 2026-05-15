const jwt = require("jsonwebtoken");
const Payment = require("../models/Payment");
const FailedEvent = require("../models/FailedEvent");
const { createStripeClient } = require("../config/stripe");
const { createHttpCircuitBreaker } = require("../utils/httpClient");

const stripe = createStripeClient();
const bookingServiceBreaker = createHttpCircuitBreaker();

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
      success_url: process.env.FRONTEND_SUCCESS_URL || "http://localhost:5000/success",
      cancel_url: process.env.FRONTEND_CANCEL_URL || "http://localhost:5000/cancel",
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

      // Inform booking-service securely using circuit breaker with retry
      const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || "http://booking-service:4003";
      const token = jwt.sign({ sub: "system", roles: ["admin"] }, process.env.JWT_SECRET, { expiresIn: "10m" });

      try {
        await bookingServiceBreaker.fire(
          `${bookingServiceUrl}/bookings/${bookingId}/status`, 
          {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: "confirmed" })
          },
          3, // 3 retries
          1000 // 1s initial backoff
        );
      } catch (err) {
        console.error("Booking update failed after retries. Saving fallback event.", err.message);
        await FailedEvent.create({
          eventType: "BOOKING_CONFIRMATION_FALLBACK",
          targetUrl: `${bookingServiceUrl}/bookings/${bookingId}/status`,
          payload: { bookingId, status: "confirmed" },
          error: err.message
        });
      }

      // Emit payment.success Kafka event
      const producer = req.app.locals.kafkaProducer;
      if (producer) {
        const topic = process.env.KAFKA_PAYMENT_TOPIC || "payment.events";
        const payload = {
          type: "payment.success",
          data: {
            bookingId,
            providerPaymentId: session.id,
            amount: session.amount_total / 100,
            currency: session.currency
          }
        };

        try {
          await producer.send({
            topic,
            messages: [{ key: bookingId, value: JSON.stringify(payload) }]
          });
        } catch (kafkaErr) {
          console.error("Failed to publish payment.success event", kafkaErr);
        }
      }

    } catch (err) {
      console.error("Failed to process checkout.session.completed", err);
    }
  }

  // Stripe fires this when a checkout session expires without payment
  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const bookingId = session.metadata && session.metadata.bookingId;

    try {
      await Payment.findOneAndUpdate(
        { providerPaymentId: session.id },
        { status: "failed" }
      );

      const producer = req.app.locals.kafkaProducer;
      if (producer) {
        const topic = process.env.KAFKA_PAYMENT_TOPIC || "payment.events";
        const payload = {
          type: "payment.failed",
          data: {
            bookingId,
            providerPaymentId: session.id,
            reason: "checkout_session_expired"
          }
        };
        try {
          await producer.send({
            topic,
            messages: [{ key: bookingId || session.id, value: JSON.stringify(payload) }]
          });
          console.log(`Published payment.failed for expired session ${session.id}`);
        } catch (kafkaErr) {
          console.error("Failed to publish payment.failed (expired) event", kafkaErr);
        }
      }
    } catch (err) {
      console.error("Failed to process checkout.session.expired", err);
    }
  }

  // Stripe fires this when a card is declined or 3DS authentication fails
  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const bookingId = intent.metadata && intent.metadata.bookingId;

    try {
      // Mark any linked payment record as failed
      if (intent.id) {
        await Payment.findOneAndUpdate(
          { providerPaymentId: intent.id },
          { status: "failed" }
        );
      }

      const producer = req.app.locals.kafkaProducer;
      if (producer) {
        const topic = process.env.KAFKA_PAYMENT_TOPIC || "payment.events";
        const payload = {
          type: "payment.failed",
          data: {
            bookingId: bookingId || null,
            providerPaymentId: intent.id,
            reason: intent.last_payment_error
              ? intent.last_payment_error.message
              : "payment_intent_failed"
          }
        };
        try {
          await producer.send({
            topic,
            messages: [{ key: bookingId || intent.id, value: JSON.stringify(payload) }]
          });
          console.log(`Published payment.failed for intent ${intent.id}`);
        } catch (kafkaErr) {
          console.error("Failed to publish payment.failed (intent) event", kafkaErr);
        }
      }
    } catch (err) {
      console.error("Failed to process payment_intent.payment_failed", err);
    }
  }

  res.status(200).send();
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook
};

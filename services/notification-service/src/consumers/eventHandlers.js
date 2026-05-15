const { sendEmail } = require("../services/emailService");

const publishNotificationEvent = async (producer, type, data) => {
  if (!producer) return;
  const topic = process.env.KAFKA_NOTIFICATION_TOPIC || "notification.events";
  const payload = {
    type,
    data,
    timestamp: new Date().toISOString()
  };
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }]
    });
  } catch (error) {
    console.error(`Failed to publish ${type} event`, error);
  }
};

const handleBookingEvent = async (message, producer) => {
  try {
    const payload = JSON.parse(message.value.toString());
    const { type, data } = payload;
    
    // We assume the auth-service or booking-service includes the user's email in the payload, 
    // or we fetch it. For now, we expect data.userEmail or default to a test email.
    const to = data.userEmail || "customer@example.com";

    switch (type) {
      case "booking.created":
        await sendEmail(to, "bookingConfirmation", data);
        await publishNotificationEvent(producer, "notification.sent", { to, type: "bookingConfirmation" });
        break;
      case "booking.cancelled":
        await sendEmail(to, "cancellation", data);
        await publishNotificationEvent(producer, "notification.sent", { to, type: "cancellation" });
        break;
      // Note: "booking.confirmed" is also emitted, but we use "payment.success" for the payment email.
      // If we wanted, we could send an email here too, but payment.success is specifically requested.
      default:
        console.log(`Unhandled booking event type: ${type}`);
    }
  } catch (error) {
    console.error("Error processing booking event", error);
  }
};

const handlePaymentEvent = async (message, producer) => {
  try {
    const payload = JSON.parse(message.value.toString());
    const { type, data } = payload;
    
    const to = data.userEmail || "customer@example.com";

    if (type === "payment.success") {
      await sendEmail(to, "paymentConfirmation", {
        bookingId: data.bookingId,
        transactionId: data.providerPaymentId,
        amount: data.amount,
        currency: data.currency,
        userName: data.userName
      });
      await publishNotificationEvent(producer, "notification.sent", { to, type: "paymentConfirmation", bookingId: data.bookingId });
    } else if (type === "payment.failed") {
      await sendEmail(to, "paymentFailed", {
        bookingId: data.bookingId,
        reason: data.reason,
        userName: data.userName
      });
      await publishNotificationEvent(producer, "notification.sent", { to, type: "paymentFailed", bookingId: data.bookingId });
    } else {
      console.log(`Unhandled payment event type: ${type}`);
    }
  } catch (error) {
    console.error("Error processing payment event", error);
  }
};

module.exports = {
  handleBookingEvent,
  handlePaymentEvent,
  publishNotificationEvent
};

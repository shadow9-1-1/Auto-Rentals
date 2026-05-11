const mongoose = require("mongoose");
const { getPaymentConnection } = require("../config/analyticsDatabases");

const paymentAnalyticsSchema = new mongoose.Schema(
  {
    bookingId: String,
    userId: String,
    amount: Number,
    currency: String,
    status: String,
    provider: String
  },
  { timestamps: true, strict: false }
);

let PaymentModel = null;

const getPaymentModel = async () => {
  if (PaymentModel) {
    return PaymentModel;
  }
  const connection = await getPaymentConnection();
  PaymentModel = connection.model("Payment", paymentAnalyticsSchema);
  return PaymentModel;
};

module.exports = { getPaymentModel };

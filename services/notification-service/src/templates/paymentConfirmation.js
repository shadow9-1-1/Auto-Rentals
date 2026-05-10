const layout = require('./layout');

const paymentConfirmationTemplate = (data) => {
  const content = `
    <h3>Payment Received</h3>
    <p>Hi ${data.userName || 'Valued Customer'},</p>
    <p>We have successfully processed your payment of <strong>${data.currency || 'USD'} ${data.amount}</strong>.</p>
    <div class="details-box">
      <strong>Payment Details:</strong>
      <ul>
        <li><strong>Booking ID:</strong> ${data.bookingId}</li>
        <li><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
    </div>
    <p>Thank you for choosing Auto Rentals!</p>
  `;
  return layout(content, 'Payment Confirmation');
};

module.exports = paymentConfirmationTemplate;

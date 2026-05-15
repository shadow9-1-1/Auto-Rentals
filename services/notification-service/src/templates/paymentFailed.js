const layout = require('./layout');

const paymentFailedTemplate = (data) => {
  const content = `
    <h3>Payment Failed</h3>
    <p>Hi ${data.userName || 'Valued Customer'},</p>
    <p>Unfortunately, we were unable to process your payment for booking <strong>${data.bookingId || 'N/A'}</strong>.</p>
    <div class="details-box">
      <strong>Failure Details:</strong>
      <ul>
        <li><strong>Booking ID:</strong> ${data.bookingId || 'N/A'}</li>
        <li><strong>Reason:</strong> ${data.reason || 'Payment could not be processed'}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
    </div>
    <p>Please retry your payment or contact support if the issue persists.</p>
    <p>We apologize for the inconvenience.</p>
  `;
  return layout(content, 'Payment Failed');
};

module.exports = paymentFailedTemplate;

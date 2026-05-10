const layout = require('./layout');

const cancellationTemplate = (data) => {
  const content = `
    <h3>Booking Cancelled</h3>
    <p>Hi ${data.userName || 'Valued Customer'},</p>
    <p>We're writing to let you know that your booking (ID: <strong>${data.bookingId}</strong>) has been cancelled.</p>
    
    ${data.cancellationReason ? `
    <div class="details-box">
      <p><strong>Reason for cancellation:</strong> ${data.cancellationReason}</p>
    </div>` : ''}
    
    <p>If you have already paid, a refund will be issued to your original payment method within 3-5 business days.</p>
    <p>We hope to see you again soon.</p>
  `;
  return layout(content, 'Booking Cancellation');
};

module.exports = cancellationTemplate;

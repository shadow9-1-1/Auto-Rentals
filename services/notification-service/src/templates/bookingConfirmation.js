const layout = require('./layout');

const bookingConfirmationTemplate = (data) => {
  const content = `
    <h3>Booking Confirmed!</h3>
    <p>Hi ${data.userName || 'Valued Customer'},</p>
    <p>Your booking for <strong>${data.vehicleMake || 'your vehicle'} ${data.vehicleModel || ''}</strong> has been successfully confirmed.</p>
    <div class="details-box">
      <strong>Booking Details:</strong>
      <ul>
        <li><strong>Booking ID:</strong> ${data.bookingId}</li>
        <li><strong>Start Date:</strong> ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A'}</li>
        <li><strong>End Date:</strong> ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A'}</li>
      </ul>
    </div>
    <p>If you have any questions, feel free to reply to this email.</p>
  `;
  return layout(content, 'Booking Confirmation');
};

module.exports = bookingConfirmationTemplate;

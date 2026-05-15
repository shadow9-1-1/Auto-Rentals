const layout = require('./layout');
const bookingConfirmation = require('./bookingConfirmation');
const paymentConfirmation = require('./paymentConfirmation');
const paymentFailed = require('./paymentFailed');
const cancellation = require('./cancellation');

module.exports = {
  layout,
  bookingConfirmation,
  paymentConfirmation,
  paymentFailed,
  cancellation
};

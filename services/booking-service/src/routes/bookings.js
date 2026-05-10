const router = require("express").Router();
const bookingController = require("../controllers/bookingController");

router.get("/", bookingController.listBookings);
router.post("/", bookingController.createBooking);
router.patch("/:id/status", bookingController.updateBookingStatus);

module.exports = router;

const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middlewares/auth");

router.get("/", authenticateUser, bookingController.listBookings);
router.post("/", authenticateUser, bookingController.createBooking);
router.patch("/:id/status", authenticateUser, bookingController.updateBookingStatus);

module.exports = router;

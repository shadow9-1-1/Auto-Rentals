const router = require("express").Router();
const bookingController = require("../controllers/bookingController");

router.get("/", bookingController.listBookings);
router.post("/", bookingController.createBooking);

module.exports = router;

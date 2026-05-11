const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middlewares/auth");
const { requireBookingAdmin } = require("../middlewares/requireBookingAdmin");

router.get("/", authenticateUser, bookingController.listBookings);
router.post("/", authenticateUser, bookingController.createBooking);
router.patch("/:id/status", authenticateUser, bookingController.updateBookingStatus);

router.get("/admin/activity", requireBookingAdmin, bookingController.listBookingActivity);
router.get("/admin/stats", requireBookingAdmin, bookingController.getBookingStats);
router.patch("/admin/:id/cancel", requireBookingAdmin, bookingController.cancelBookingAdmin);

module.exports = router;

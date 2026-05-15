const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middlewares/auth");
const { requireBookingAdmin } = require("../middlewares/requireBookingAdmin");
const validate = require("../middlewares/validate");
const { createBookingSchema, updateStatusSchema } = require("../validations/bookingValidation");

router.get("/", authenticateUser, bookingController.listBookings);
router.post("/", authenticateUser, validate({ body: createBookingSchema }), bookingController.createBooking);
router.patch("/:id/status", authenticateUser, validate({ body: updateStatusSchema }), bookingController.updateBookingStatus);

router.get("/admin/activity", requireBookingAdmin, bookingController.listBookingActivity);
router.get("/admin/stats", requireBookingAdmin, bookingController.getBookingStats);
router.patch("/admin/:id/cancel", requireBookingAdmin, bookingController.cancelBookingAdmin);

module.exports = router;

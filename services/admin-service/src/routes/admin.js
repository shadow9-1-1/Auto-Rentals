const router = require("express").Router();
const adminController = require("../controllers/adminController");
const analyticsController = require("../controllers/analyticsController");

router.get("/overview", adminController.getOverview);
router.get("/analytics/revenue", analyticsController.getRevenueAnalytics);
router.get("/analytics/bookings", analyticsController.getBookingAnalytics);
router.get("/analytics/users", analyticsController.getUserGrowthAnalytics);
router.get("/analytics/vehicles", analyticsController.getVehicleUsageAnalytics);

module.exports = router;

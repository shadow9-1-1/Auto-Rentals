const router = require("express").Router();
const notificationController = require("../controllers/notificationController");

router.post("/test", notificationController.sendTestEmail);

module.exports = router;

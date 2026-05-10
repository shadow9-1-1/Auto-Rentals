const router = require("express").Router();
const paymentController = require("../controllers/paymentController");

router.post("/checkout", paymentController.createCheckoutSession);

module.exports = router;

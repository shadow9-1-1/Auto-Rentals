const router = require("express").Router();
const paymentController = require("../controllers/paymentController");

router.post("/intent", paymentController.createPaymentIntent);

module.exports = router;

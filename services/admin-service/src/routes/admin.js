const router = require("express").Router();
const adminController = require("../controllers/adminController");

router.get("/overview", adminController.getOverview);

module.exports = router;

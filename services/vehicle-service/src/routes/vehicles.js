const router = require("express").Router();
const vehicleController = require("../controllers/vehicleController");

router.get("/", vehicleController.listVehicles);
router.post("/", vehicleController.createVehicle);

module.exports = router;

const router = require("express").Router();
const vehicleController = require("../controllers/vehicleController");
const requireVehicleOwner = require("../middlewares/requireVehicleOwner");

router.get("/", vehicleController.listVehicles);
router.post(
	"/",
	requireVehicleOwner,
	vehicleController.upload.array("images", 10),
	vehicleController.validateCreateVehicle,
	vehicleController.createVehicle
);

module.exports = router;

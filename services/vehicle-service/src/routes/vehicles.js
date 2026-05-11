const router = require("express").Router();
const vehicleController = require("../controllers/vehicleController");
const requireVehicleOwner = require("../middlewares/requireVehicleOwner");

router.get("/", vehicleController.listVehicles);
router.get("/ratings/top", vehicleController.getTopRatedVehicles);
router.post(
	"/",
	requireVehicleOwner,
	vehicleController.upload.array("images", 10),
	vehicleController.validateCreateVehicle,
	vehicleController.createVehicle
);

router.get("/:id", vehicleController.getVehicle);
router.get("/:id/ratings", vehicleController.getVehicleRatings);

router.put(
  "/:id",
  requireVehicleOwner,
  vehicleController.upload.array("images", 10),
  vehicleController.updateVehicle
);

router.delete(
  "/:id",
  requireVehicleOwner,
  vehicleController.deleteVehicle
);

module.exports = router;

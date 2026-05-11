const router = require("express").Router();
const vehicleController = require("../controllers/vehicleController");
const requireVehicleOwner = require("../middlewares/requireVehicleOwner");
const requireVehicleAdmin = require("../middlewares/requireVehicleAdmin");

router.get("/", vehicleController.listVehicles);
router.get("/ratings/top", vehicleController.getTopRatedVehicles);
router.get("/admin/listings", requireVehicleAdmin, vehicleController.listAdminVehicles);
router.patch("/admin/:id/approve", requireVehicleAdmin, vehicleController.approveVehicleListing);
router.patch("/admin/:id/remove", requireVehicleAdmin, vehicleController.removeVehicleListing);
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

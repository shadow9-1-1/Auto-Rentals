const router = require("express").Router();
const requireAdmin = require("../middlewares/requireAdmin");
const adminUserController = require("../controllers/adminUserController");

router.use(requireAdmin);

router.get("/", adminUserController.getAllUsers);
router.patch("/:userId/suspend", adminUserController.suspendUser);
router.patch("/:userId/roles", adminUserController.updateUserRoles);
router.delete("/:userId", adminUserController.deleteUser);

module.exports = router;

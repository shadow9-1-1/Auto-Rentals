const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: process.env.SERVICE_NAME || "admin-service"
  });
});

module.exports = router;

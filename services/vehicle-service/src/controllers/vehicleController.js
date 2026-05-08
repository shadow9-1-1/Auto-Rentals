const Vehicle = require("../models/Vehicle");

const listVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.status(200).json({ items: vehicles });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ item: vehicle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVehicles,
  createVehicle
};

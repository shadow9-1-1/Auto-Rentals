const fs = require("fs");
const path = require("path");
const multer = require("multer");

const Vehicle = require("../models/Vehicle");

const uploadDir = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  return value;
};

const validateCreateVehicle = (req, res, next) => {
  require('fs').appendFileSync('validation-log.txt', `validateCreateVehicle called. body: ${JSON.stringify(req.body)}\n`);
  const body = req.body || {};
  const errors = [];

  const ownerId = req.user ? req.user.id : String(body.ownerId || "").trim();
  const make = String(body.make || "").trim();
  const model = String(body.model || "").trim();
  const year = Number(body.year);
  const pricing = parseJsonField(body.pricing, body.pricing);
  const location = parseJsonField(body.location, body.location) || {};
  const availability = parseJsonField(body.availability, body.availability) || [];

  if (!ownerId) errors.push("ownerId is required");
  if (!make) errors.push("make is required");
  if (!model) errors.push("model is required");
  if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1) {
    errors.push("year is invalid");
  }
  if (!pricing || Number.isNaN(Number(pricing.perDay)) || Number(pricing.perDay) < 0) {
    errors.push("pricing.perDay is required and must be a valid number");
  }
  if (availability && !Array.isArray(availability)) {
    errors.push("availability must be an array");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  req.body.ownerId = ownerId;
  req.body.make = make;
  req.body.model = model;
  req.body.year = year;
  req.body.pricing = pricing;
  req.body.location = location;
  req.body.availability = availability;

  return next();
};

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
    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          caption: file.originalname,
          isPrimary: index === 0,
          sortOrder: index
        }))
      : [];

    const bodyImages = Array.isArray(req.body.images)
      ? req.body.images
      : typeof req.body.images === "string"
        ? parseJsonField(req.body.images, [])
        : [];

    const vehicle = await Vehicle.create({
      ...req.body,
      ownerId: req.user ? req.user.id : req.body.ownerId,
      images: [...bodyImages, ...uploadedImages]
    });
    res.status(201).json({ item: vehicle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVehicles,
  createVehicle,
  upload,
  validateCreateVehicle
};

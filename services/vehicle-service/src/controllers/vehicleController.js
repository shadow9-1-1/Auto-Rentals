const fs = require("fs");
const path = require("path");
const multer = require("multer");

const Vehicle = require("../models/Vehicle");
const { redisClient } = require("../config/redis");

const invalidateSearchCache = async () => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.sMembers("vehicle:search_keys");
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
      await redisClient.del("vehicle:search_keys");
    }
  } catch (err) {
    console.error("Redis invalidation error:", err);
  }
};

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
  const body = req.body || {};
  const errors = [];

  const ownerId = req.user ? req.user.id : String(body.ownerId || "").trim();
  const type = String(body.type || "").trim().toLowerCase();
  const make = String(body.make || "").trim();
  const model = String(body.model || "").trim();
  const year = Number(body.year);
  const pricing = parseJsonField(body.pricing, body.pricing);
  const location = parseJsonField(body.location, body.location) || {};
  const availability = parseJsonField(body.availability, body.availability) || [];

  const validTypes = ["sedan", "suv", "truck", "van", "coupe", "convertible", "hatchback", "wagon", "other"];

  if (!ownerId) errors.push("ownerId is required");
  if (!type || !validTypes.includes(type)) errors.push(`type is required and must be one of: ${validTypes.join(", ")}`);
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
  req.body.type = type;
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
    const {
      lat,
      lng,
      radius, // in kilometers
      minPrice,
      maxPrice,
      startDate,
      endDate,
      type,
      make,
      page = 1,
      limit = 10,
      sortBy = "newest"
    } = req.query;

    const query = { status: "available" };

    // 1. Geospatial Location Filter
    if (lat && lng && radius) {
      const radiusInRadians = Number(radius) / 6378.1; // Earth's radius in km
      query["location.coordinates"] = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
        }
      };
    }

    // 2. Price Filter
    if (minPrice || maxPrice) {
      query["pricing.perDay"] = {};
      if (minPrice) query["pricing.perDay"].$gte = Number(minPrice);
      if (maxPrice) query["pricing.perDay"].$lte = Number(maxPrice);
    }

    // 3. Type & Make Filter
    if (type) {
      query.type = String(type).trim().toLowerCase();
    }
    if (make) {
      // Case-insensitive regex search for make
      query.make = { $regex: new RegExp(String(make).trim(), "i") };
    }

    // 4. Availability Date Filter
    if (startDate && endDate) {
      const searchStart = new Date(startDate);
      const searchEnd = new Date(endDate);

      // We want vehicles that DO NOT have an overlapping booked/blocked status
      query.availability = {
        $not: {
          $elemMatch: {
            status: { $in: ["booked", "blocked"] },
            startDate: { $lt: searchEnd },
            endDate: { $gt: searchStart }
          }
        }
      };
    }

    // 5. Sorting Options
    let sortObj = { createdAt: -1 };
    if (sortBy === "price_asc") sortObj = { "pricing.perDay": 1 };
    if (sortBy === "price_desc") sortObj = { "pricing.perDay": -1 };

    // 6. Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Redis Cache Check
    const cacheKey = `vehicle:search:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
    if (redisClient.isOpen) {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return res.status(200).json(JSON.parse(cachedResult));
      }
    }

    // Execute queries in parallel using .lean() for maximum performance (<300ms)
    const [vehicles, totalItems] = await Promise.all([
      Vehicle.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Vehicle.countDocuments(query)
    ]);

    const result = {
      items: vehicles,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    };

    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result)); // Cache for 5 minutes
      await redisClient.sAdd("vehicle:search_keys", cacheKey);
    }

    res.status(200).json(result);
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

    await invalidateSearchCache();

    res.status(201).json({ item: vehicle });
  } catch (error) {
    next(error);
  }
};

const getVehicle = async (req, res, next) => {
  try {
    const cacheKey = `vehicle:${req.params.id}`;
    if (redisClient.isOpen) {
      const cachedVehicle = await redisClient.get(cacheKey);
      if (cachedVehicle) {
        return res.status(200).json({ item: JSON.parse(cachedVehicle) });
      }
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 900, JSON.stringify(vehicle)); // Cache for 15 minutes
    }

    res.status(200).json({ item: vehicle });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Verify ownership
    const isOwner = req.user && req.user.id === vehicle.ownerId;
    const isAdmin = req.user && req.user.roles.includes("admin");
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to update this vehicle" });
    }

    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          caption: file.originalname,
          isPrimary: vehicle.images.length === 0 && index === 0,
          sortOrder: vehicle.images.length + index
        }))
      : [];

    const bodyImages = Array.isArray(req.body.images)
      ? req.body.images
      : typeof req.body.images === "string"
        ? parseJsonField(req.body.images, [])
        : undefined;

    const updates = { ...req.body };
    delete updates.ownerId; // Prevent changing owner

    if (bodyImages !== undefined || uploadedImages.length > 0) {
      updates.images = [...(bodyImages || vehicle.images), ...uploadedImages];
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (redisClient.isOpen) {
      await redisClient.del(`vehicle:${vehicleId}`);
    }
    await invalidateSearchCache();

    res.status(200).json({ item: updatedVehicle });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Verify ownership
    const isOwner = req.user && req.user.id === vehicle.ownerId;
    const isAdmin = req.user && req.user.roles.includes("admin");
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to delete this vehicle" });
    }

    // Soft delete: set status to unavailable
    vehicle.status = "unavailable";
    await vehicle.save();

    if (redisClient.isOpen) {
      await redisClient.del(`vehicle:${vehicleId}`);
    }
    await invalidateSearchCache();

    res.status(200).json({ status: "Vehicle soft deleted successfully", item: vehicle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  upload,
  validateCreateVehicle
};

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

const validateVehiclePayload = (req, res, next) => {
  const body = req.body || {};
  const pricing = parseJsonField(body.pricing, body.pricing);
  const location = parseJsonField(body.location, body.location);
  const availability = parseJsonField(body.availability, body.availability);

  const errors = [];
  const make = String(body.make || "").trim();
  const model = String(body.model || "").trim();
  const year = Number(body.year);
  const ownerId = String(body.ownerId || "").trim();
  const perDay = pricing && Number(pricing.perDay);

  if (!ownerId) errors.push("ownerId is required");
  if (!make) errors.push("make is required");
  if (!model) errors.push("model is required");
  if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1) {
    errors.push("year is invalid");
  }
  if (!pricing || Number.isNaN(perDay) || perDay < 0) {
    errors.push("pricing.perDay is required and must be a valid number");
  }
  if (location && location.coordinates && !Array.isArray(location.coordinates.coordinates)) {
    errors.push("location.coordinates.coordinates must be an array");
  }
  if (availability && !Array.isArray(availability)) {
    errors.push("availability must be an array");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  req.body.make = make;
  req.body.model = model;
  req.body.year = year;
  req.body.pricing = pricing;
  req.body.location = location || {};
  req.body.availability = availability || [];

  return next();
};

module.exports = validateVehiclePayload;

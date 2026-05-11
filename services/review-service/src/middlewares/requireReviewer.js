const jwt = require("jsonwebtoken");

const requireReviewer = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT secret is not configured" });
  }

  try {
    const payload = jwt.verify(token, secret);
    const roles = Array.isArray(payload.roles)
      ? payload.roles
      : payload.role
        ? [payload.role]
        : [];

    const normalizedRoles = roles.map((role) => (role === "user" ? "renter" : role));
    if (!normalizedRoles.includes("renter")) {
      return res.status(403).json({ error: "Renter role required" });
    }

    req.user = {
      id: payload.sub,
      roles: normalizedRoles
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = requireReviewer;

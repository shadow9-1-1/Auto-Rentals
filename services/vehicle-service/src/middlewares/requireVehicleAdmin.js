const jwt = require("jsonwebtoken");

const extractToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
};

const normalizeRoles = (roles) => {
  const roleList = Array.isArray(roles) ? roles : [];
  return roleList.map((role) => (role === "user" ? "renter" : role));
};

const requireVehicleAdmin = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT secret is not configured" });
  }

  try {
    const payload = jwt.verify(token, secret);
    const roles = normalizeRoles(
      Array.isArray(payload.roles) ? payload.roles : payload.role ? [payload.role] : []
    );

    if (!roles.includes("admin")) {
      return res.status(403).json({ error: "Admin role required" });
    }

    req.user = {
      id: payload.sub,
      roles,
      role: roles[0]
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = requireVehicleAdmin;

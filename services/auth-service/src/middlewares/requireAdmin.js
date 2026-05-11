const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

const requireAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT secret is not configured" });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = payload && payload.sub ? String(payload.sub) : "";
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("roles isActive").lean();
    if (!user || !user.isActive) {
      return res.status(403).json({ error: "Account is disabled" });
    }

    const roles = normalizeRoles(user.roles);
    if (!roles.includes("admin")) {
      return res.status(403).json({ error: "Admin role required" });
    }

    req.user = {
      id: userId,
      roles
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireAdmin;

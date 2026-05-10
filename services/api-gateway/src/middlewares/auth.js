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

const requireAuth = (req, res, next) => {
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

const authorizeRoles = (allowedRoles) => (req, res, next) => {
  const roles = normalizeRoles((req.user && req.user.roles) || []);
  if (!roles.some((role) => allowedRoles.includes(role))) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};

const requireRolesForMethods = (methodRoles, defaultRoles) => (req, res, next) => {
  const roles = methodRoles[req.method.toUpperCase()] || defaultRoles;
  if (!roles) {
    return next();
  }
  return authorizeRoles(roles)(req, res, next);
};

const allowPublicRoutes = (paths) => (req, res, next) => {
  if (paths.some((path) => req.path.startsWith(path))) {
    return next();
  }
  return requireAuth(req, res, next);
};

module.exports = {
  allowPublicRoutes,
  authorizeRoles,
  requireRolesForMethods
};

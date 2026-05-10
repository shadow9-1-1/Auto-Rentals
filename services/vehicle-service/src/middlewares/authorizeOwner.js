const authorizeOwner = (req, res, next) => {
  const roles = Array.isArray(req.user && req.user.roles) ? req.user.roles : [];
  if (roles.includes("owner") || roles.includes("admin")) {
    return next();
  }

  return res.status(403).json({ error: "Owner role required" });
};

module.exports = authorizeOwner;

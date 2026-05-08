const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const createToken = (user) => {
  const payload = { sub: user._id, role: user.role, roles: user.roles };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password, role, roles } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedRoles = Array.isArray(roles) && roles.length ? roles : role ? [role] : undefined;
    const user = await User.create({ email, passwordHash, roles: normalizedRoles });

    const token = createToken(user);
    res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is disabled" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);
    res.status(200).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const createAccessToken = (user) => {
  const payload = { sub: user._id, role: user.role, roles: user.roles };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

const createRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ sub: user._id, type: "refresh" }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Email is invalid" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, passwordHash, roles: ["renter"] });

    const token = createAccessToken(user);
    res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Email is invalid" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = await User.findOne({ email: normalizedEmail });
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

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    res.status(200).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token: accessToken,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const googleCallback = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Google authentication failed" });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return res.status(200).json({
    user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
    token: accessToken,
    accessToken,
    refreshToken
  });
};

const googleFailure = (req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
};

module.exports = {
  register,
  login,
  googleCallback,
  googleFailure
};

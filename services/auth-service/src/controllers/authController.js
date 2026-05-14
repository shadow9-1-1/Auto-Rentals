const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const createAccessToken = (user) => {
  const payload = { sub: user._id, role: user.role, roles: user.roles };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

const createRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: String(user._id), type: "refresh", jti }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
  return { token, jti };
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const persistRefreshToken = async (userId, token, jti) => {
  const decoded = jwt.decode(token);
  const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 86400000);
  return RefreshToken.create({
    userId: String(userId),
    jti,
    tokenHash: hashToken(token),
    expiresAt
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
    const refreshPayload = createRefreshToken(user);
    await persistRefreshToken(user._id, refreshPayload.token, refreshPayload.jti);
    res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token,
      accessToken: token,
      refreshToken: refreshPayload.token
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
    const refreshPayload = createRefreshToken(user);
    await persistRefreshToken(user._id, refreshPayload.token, refreshPayload.jti);
    res.status(200).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token: accessToken,
      accessToken,
      refreshToken: refreshPayload.token
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT secret is not configured" });
    }

    const payload = jwt.verify(refreshToken, secret);
    if (!payload || payload.type !== "refresh") {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await RefreshToken.findOne({
      userId: payload.sub,
      jti: payload.jti,
      tokenHash
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: "Refresh token has been revoked" });
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: "Account is disabled" });
    }

    const accessToken = createAccessToken(user);
    const refreshPayload = createRefreshToken(user);
    await persistRefreshToken(user._id, refreshPayload.token, refreshPayload.jti);

    storedToken.revokedAt = new Date();
    storedToken.revokedReason = "rotated";
    storedToken.replacedByTokenHash = hashToken(refreshPayload.token);
    await storedToken.save();

    return res.status(200).json({
      user: { id: user._id, email: user.email, role: user.role, roles: user.roles },
      token: accessToken,
      accessToken,
      refreshToken: refreshPayload.token
    });
  } catch (error) {
    if (error && error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Refresh token expired" });
    }
    if (error && error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const payload = jwt.verify(refreshToken, secret);
    const tokenHash = hashToken(refreshToken);

    await RefreshToken.updateOne(
      { userId: payload.sub, jti: payload.jti, tokenHash },
      { revokedAt: new Date(), revokedReason: "logout" }
    );

    return res.status(200).json({ status: "logged out" });
  } catch (error) {
    if (error && (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError")) {
      return res.status(200).json({ status: "logged out" });
    }
    return next(error);
  }
};

const googleCallback = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Google authentication failed" });
  }

  try {
    const accessToken = createAccessToken(user);
    const refreshPayload = createRefreshToken(user);
    await persistRefreshToken(user._id, refreshPayload.token, refreshPayload.jti);

    const userData = { id: user._id, email: user.email, role: user.role, roles: user.roles };
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    const redirectUrl = `${frontendUrl}/auth/google/callback?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshPayload.token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    return next(error);
  }
};

const googleFailure = (req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
};

module.exports = {
  register,
  login,
  googleCallback,
  googleFailure,
  refresh,
  logout
};

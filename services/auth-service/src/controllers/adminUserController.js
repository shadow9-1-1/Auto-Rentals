const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const ROLE_VALUES = ["renter", "owner", "admin", "manager", "support", "user"];

const normalizeRoles = (roles) => {
  const roleList = Array.isArray(roles) ? roles : [];
  const normalized = roleList.map((role) => String(role || "").trim().toLowerCase());
  return Array.from(new Set(normalized.filter(Boolean)));
};

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    email: user.email,
    roles: user.roles,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile
  };
};

const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search
    } = req.query;

    const query = {};

    if (role) {
      query.roles = String(role).trim().toLowerCase();
    }

    if (isActive !== undefined) {
      const parsed = String(isActive).trim().toLowerCase();
      if (parsed === "true" || parsed === "false") {
        query.isActive = parsed === "true";
      }
    }

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      query.email = { $regex: regex };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, totalItems] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("email roles isActive emailVerified lastLoginAt createdAt updatedAt profile")
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      items: users.map((user) => sanitizeUser(user)),
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const targetUserId = String(req.params.userId || "").trim();
    if (!targetUserId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (req.user && req.user.id === targetUserId) {
      return res.status(400).json({ error: "You cannot suspend your own account" });
    }

    let isActive = false;
    if (typeof req.body.isActive === "boolean") {
      isActive = req.body.isActive;
    } else if (typeof req.body.suspended === "boolean") {
      isActive = !req.body.suspended;
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { $set: { isActive } },
      { new: true }
    ).select("email roles isActive emailVerified lastLoginAt createdAt updatedAt profile");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!isActive) {
      await RefreshToken.updateMany(
        { userId: targetUserId, revokedAt: { $exists: false } },
        { revokedAt: new Date(), revokedReason: "suspended" }
      );
    }

    res.status(200).json({ item: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = String(req.params.userId || "").trim();
    if (!targetUserId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (req.user && req.user.id === targetUserId) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(targetUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await RefreshToken.deleteMany({ userId: targetUserId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const updateUserRoles = async (req, res, next) => {
  try {
    const targetUserId = String(req.params.userId || "").trim();
    if (!targetUserId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const roles = normalizeRoles(req.body.roles);
    if (!roles || roles.length === 0) {
      return res.status(400).json({ error: "roles must be a non-empty array" });
    }

    const invalidRoles = roles.filter((role) => !ROLE_VALUES.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: "Invalid roles", details: invalidRoles });
    }

    if (req.user && req.user.id === targetUserId && !roles.includes("admin")) {
      return res.status(400).json({ error: "You cannot remove your own admin role" });
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { $set: { roles } },
      { new: true }
    ).select("email roles isActive emailVerified lastLoginAt createdAt updatedAt profile");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await RefreshToken.updateMany(
      { userId: targetUserId, revokedAt: { $exists: false } },
      { revokedAt: new Date(), revokedReason: "roles-updated" }
    );

    res.status(200).json({ item: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  suspendUser,
  deleteUser,
  updateUserRoles
};

const mongoose = require("mongoose");

const roleValues = ["renter", "owner", "admin", "manager", "support", "user"];
const oauthProviders = ["google", "github", "facebook", "apple"];

const oauthProviderSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: oauthProviders
    },
    providerId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String
    },
    roles: {
      type: [String],
      enum: roleValues,
      default: ["renter"],
      validate: {
        validator: (roles) => Array.isArray(roles) && roles.length > 0,
        message: "At least one role is required"
      }
    },
    oauthProviders: {
      type: [oauthProviderSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifiedAt: {
      type: Date
    },
    lastLoginAt: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpiresAt: {
      type: Date
    },
    profile: {
      firstName: {
        type: String,
        trim: true
      },
      lastName: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      avatarUrl: {
        type: String,
        trim: true
      }
    }
  },
  { timestamps: true }
);

userSchema.virtual("role").get(function () {
  if (!this.roles || this.roles.length === 0) {
    return "user";
  }
  return this.roles[0];
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpiresAt;
    return ret;
  }
});

module.exports = mongoose.model("User", userSchema);

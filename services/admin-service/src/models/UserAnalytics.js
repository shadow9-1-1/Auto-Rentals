const mongoose = require("mongoose");
const { getAuthConnection } = require("../config/analyticsDatabases");

const userAnalyticsSchema = new mongoose.Schema(
  {
    email: String,
    roles: [String],
    isActive: Boolean
  },
  { timestamps: true, strict: false }
);

let UserModel = null;

const getUserModel = async () => {
  if (UserModel) {
    return UserModel;
  }
  const connection = await getAuthConnection();
  UserModel = connection.model("User", userAnalyticsSchema);
  return UserModel;
};

module.exports = { getUserModel };

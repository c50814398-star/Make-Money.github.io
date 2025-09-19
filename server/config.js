module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "replace_with_secure_secret",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tiktok_rewards",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
  PORT: process.env.PORT || 4000,
  CREDIT_PER_ACTION: 0.5
};

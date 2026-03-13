const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');

const tokenKey = (token) => `jwt:deny:${token}`;

const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    // If no exp, deny-list with a short TTL to avoid permanent keys
    await redisClient.set(tokenKey(token), '1', { EX: 3600 });
    return;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.max(decoded.exp - nowSeconds, 1);
  await redisClient.set(tokenKey(token), '1', { EX: ttlSeconds });
};

const isTokenBlacklisted = async (token) => {
  const val = await redisClient.get(tokenKey(token));
  return Boolean(val);
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
};

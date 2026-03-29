const { redisClient } = require('../config/redis');
const config = require('../config/env');

const DEFAULT_TTL_SECONDS = config.cacheTtlSeconds;

const buildKey = (...parts) => {
  return ['cache', ...parts].join(':');
};

const getJson = async (key) => {
  try {
    const raw = await redisClient.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  } catch (err) {
    return null;
  }
};

const setJson = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redisClient.set(key, payload, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, payload);
    }
  } catch (err) {
    // ignore cache set errors
  }
};

const delKeys = async (keys) => {
  if (!keys || keys.length === 0) return;
  try {
    await redisClient.del(keys);
  } catch (err) {
    // ignore cache delete errors
  }
};

const delByPattern = async (pattern) => {
  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }
    await delKeys(keys);
  } catch (err) {
    // ignore cache scan errors
  }
};

module.exports = {
  buildKey,
  getJson,
  setJson,
  delByPattern,
};


const redis = require('redis');
const config = require('./env');

const redisHost = config.redis.host || 'localhost';
const redisPort = config.redis.port || 6379;
const explicitUrl = config.redis.url;
const hostIsUrl = typeof redisHost === 'string' && redisHost.startsWith('redis://');
const redisUrl = explicitUrl || (hostIsUrl ? redisHost : `redis://${redisHost}:${redisPort}`);

const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

const connectRedis = async () => {
  if (client.isOpen) return;
  try {
    await client.connect();
  } catch (err) {
    console.log('Redis connection failed:', err.message);
  }
};

// Best-effort connect on startup
connectRedis();

let redisConnection = {
  host: redisHost,
  port: Number(redisPort),
};

try {
  const parsedUrl = new URL(redisUrl);
  if (parsedUrl.hostname) {
    redisConnection = {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || redisPort),
    };
  }
} catch (err) {
  // ignore URL parsing errors
}

module.exports = {
  redisClient: client,
  connectRedis,
  redisConnection,
};

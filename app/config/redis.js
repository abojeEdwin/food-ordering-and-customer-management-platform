
const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const explicitUrl = process.env.REDIS_URL;
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

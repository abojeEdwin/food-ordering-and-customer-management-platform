const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const candidatePaths = [
  process.env.CONFIG_ENV_PATH,
  path.resolve(__dirname, '..', '.env'),
].filter(Boolean);

let selectedPath;
for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate)) {
    selectedPath = candidate;
    break;
  }
}

if (selectedPath) {
  dotenv.config({ path: selectedPath });
} else {
  dotenv.config();
}

const toNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 3000),
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: toNumber(process.env.REDIS_PORT, 6379),
    url: process.env.REDIS_URL,
  },
  cacheTtlSeconds: toNumber(process.env.CACHE_TTL_SECONDS, 60),
  otpTtlSeconds: toNumber(process.env.OTP_TTL_SECONDS, 600),
  orderQueueEnabled: process.env.ORDER_QUEUE_ENABLED === 'true',
  redisSubscriberEnabled: process.env.REDIS_SUBSCRIBER_ENABLED === 'true',
  email: {
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    fromAddress: process.env.EMAIL_FROM_ADDRESS,
    fromEmail: process.env.EMAIL_FROM_EMAIL,
    fromName: process.env.EMAIL_FROM_NAME,
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET_NAME,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  },
  adminSeed: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  envFilePath: selectedPath,
});

module.exports = config;

const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const AppError = require('../utils/appError');

const getS3Client = () => {
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  const region = process.env.S3_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new AppError('S3 credentials or region not configured', 500);
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const buildObjectKey = (folder, originalName) => {
  const ext = path.extname(originalName || '').toLowerCase();
  const safeExt = ext && ext.length <= 10 ? ext : '';
  const randomId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return `${folder}/${Date.now()}-${randomId}${safeExt}`;
};

const resolvePublicUrl = (bucket, region, key) => {
  const explicitBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (explicitBaseUrl) {
    return `${explicitBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const uploadImage = async (file, folder) => {
  if (!file) {
    throw new AppError('Image file is required', 400);
  }

  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION;

  if (!bucket) {
    throw new AppError('S3 bucket not configured', 500);
  }

  const s3 = getS3Client();
  const key = buildObjectKey(folder, file.originalname);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return {
    key,
    url: resolvePublicUrl(bucket, region, key),
  };
};

module.exports = {
  uploadImage,
};

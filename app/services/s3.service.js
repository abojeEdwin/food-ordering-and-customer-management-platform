const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config/env');
const S3BucketException = require("../exceptions/S3BucketException");

const getS3Client = () => {
  const accessKeyId = config.s3.accessKeyId;
  const secretAccessKey = config.s3.secretAccessKey;
  const region = config.s3.region;

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new S3BucketException('S3 credentials or region not configured', 500);
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
  const explicitBaseUrl = config.s3.publicBaseUrl;
  if (explicitBaseUrl) {
    return `${explicitBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const uploadImage = async (file, folder) => {
  if (!file) {
    throw new S3BucketException('Image file is required', 400);
  }

  const bucket = config.s3.bucket;
  const region = config.s3.region;

  if (!bucket) {
    throw new S3BucketException('S3 bucket not configured', 500);
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

const deleteObject = async (key) => {
  if (!key) {
    return;
  }

  const bucket = config.s3.bucket;
  if (!bucket) {
    throw new S3BucketException('S3 bucket not configured', 500);
  }

  const s3 = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3.send(command);
};

module.exports = {
  uploadImage,
  deleteObject,
};

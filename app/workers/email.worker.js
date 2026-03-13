const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const { sendEmailDirect } = require('../services/email.service');

const worker = new Worker(
  'email',
  async (job) => {
    await sendEmailDirect(job.data);
  },
  { connection: redisConnection }
);

worker.on('completed', (job) => {
  console.log(`Email job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.log(`Email job failed: ${job && job.id}`, err.message);
});

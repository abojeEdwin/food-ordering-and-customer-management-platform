const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const emailQueue = new Queue('email', {
  connection: redisConnection,
});

const queueEmail = async (payload) => {
  return emailQueue.add('send', payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

module.exports = {
  emailQueue,
  queueEmail,
};

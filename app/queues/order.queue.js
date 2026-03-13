const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const orderQueue = new Queue('order', {
  connection: redisConnection,
});

const queueOrderStatus = async (payload) => {
  return orderQueue.add('status-update', payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

module.exports = {
  orderQueue,
  queueOrderStatus,
};

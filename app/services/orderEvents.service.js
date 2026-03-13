const { redisClient } = require('../config/redis');
const { publish } = require('./redisPubSub.service');
const { queueOrderStatus } = require('../queues/order.queue');

const ORDER_STATUS_CHANNEL = 'orders:status';
const ORDER_EVENTS_STREAM = 'order:events';

const appendOrderEvent = async (eventType, order, meta = {}) => {
  const now = new Date().toISOString();
  try {
    await redisClient.xAdd(
      ORDER_EVENTS_STREAM,
      '*',
      {
        eventType,
        orderId: String(order._id || order.id || ''),
        status: String(order.status || ''),
        paymentStatus: String(order.paymentStatus || ''),
        timestamp: now,
        meta: JSON.stringify(meta),
      }
    );
  } catch (err) {
    console.log('Order stream append failed:', err.message);
  }
};

const publishOrderStatus = async (eventType, order, meta = {}) => {
  try {
    await publish(ORDER_STATUS_CHANNEL, {
      eventType,
      orderId: order._id || order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      meta,
    });
  } catch (err) {
    console.log('Order status publish failed:', err.message);
  }
};

const enqueueOrderNotification = async (order) => {
  if (process.env.ORDER_QUEUE_ENABLED !== 'true') {
    return;
  }
  try {
    await queueOrderStatus({
      orderId: order._id || order.id,
      status: order.status,
    });
  } catch (err) {
    console.log('Order notification enqueue failed:', err.message);
  }
};

module.exports = {
  appendOrderEvent,
  publishOrderStatus,
  enqueueOrderNotification,
  ORDER_STATUS_CHANNEL,
  ORDER_EVENTS_STREAM,
};

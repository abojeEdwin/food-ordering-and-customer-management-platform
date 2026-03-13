const { subscribe } = require('../services/redisPubSub.service');
const { ORDER_STATUS_CHANNEL } = require('../services/orderEvents.service');

const startOrderStatusSubscriber = async () => {
  await subscribe(ORDER_STATUS_CHANNEL, (payload) => {
    console.log('Order status event received:', payload);
  });
};

module.exports = {
  startOrderStatusSubscriber,
};

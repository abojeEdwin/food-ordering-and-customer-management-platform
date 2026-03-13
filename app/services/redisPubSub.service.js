const { redisClient } = require('../config/redis');

const publisher = redisClient.duplicate();
const subscriber = redisClient.duplicate();

const ensurePubSub = async () => {
  if (!publisher.isOpen) {
    await publisher.connect();
  }
  if (!subscriber.isOpen) {
    await subscriber.connect();
  }
};

const publish = async (channel, payload) => {
  await ensurePubSub();
  const message = JSON.stringify(payload);
  await publisher.publish(channel, message);
};

const subscribe = async (channel, handler) => {
  await ensurePubSub();
  await subscriber.subscribe(channel, (message) => {
    let parsed = message;
    try {
      parsed = JSON.parse(message);
    } catch (err) {
      // keep raw message
    }
    handler(parsed);
  });
};

module.exports = {
  publish,
  subscribe,
};


const connectDB = require('./config/db');
const { startOrderStatusSubscriber } = require('./subscribers/orderStatus.subscriber');
const config = require('./config/env');


process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

connectDB();

const port = config.port;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

if (config.redisSubscriberEnabled) {
  startOrderStatusSubscriber().catch((err) => {
    console.log('Order status subscriber failed:', err.message);
  });
}

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

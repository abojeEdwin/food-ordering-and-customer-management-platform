
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startOrderStatusSubscriber } = require('./subscribers/orderStatus.subscriber');


process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./app');

connectDB();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

if (process.env.REDIS_SUBSCRIBER_ENABLED === 'true') {
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

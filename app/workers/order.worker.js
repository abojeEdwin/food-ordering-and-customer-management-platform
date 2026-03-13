const dotenv = require('dotenv');
const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const connectDB = require('../config/db');
const Order = require('../model/order.model');
const { sendEmailDirect } = require('../services/email.service');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
connectDB();

const worker = new Worker(
  'order',
  async (job) => {
    const { orderId, status } = job.data;
    const order = await Order.findById(orderId).populate('customerId');
    if (!order || !order.customerId || !order.customerId.email) {
      return;
    }

    await sendEmailDirect({
      to: order.customerId.email,
      subject: 'Order status update',
      text: `Your order status is now: ${status}`,
    });
  },
  { connection: redisConnection }
);

worker.on('completed', (job) => {
  console.log(`Order job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.log(`Order job failed: ${job && job.id}`, err.message);
});

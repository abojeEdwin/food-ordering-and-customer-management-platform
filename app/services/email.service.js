
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // In development, log email to console instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text: ${options.text}`);
    console.log('-----------------------');
    return;
  }

  // In production, use a real email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Chuks Kitchen <hello@chukskitchen.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };

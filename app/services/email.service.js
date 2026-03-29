const config = require('../config/env');

const mailJet = require('node-mailjet').apiConnect(
  config.email.username,
  config.email.password
);

const sendEmail = async (options) => {

  const fromEmail =
    config.email.fromAddress || config.email.fromEmail;
  const fromName = config.email.fromName;

  const request = mailJet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: fromName,
        },
        To: [
          {
            Email: options.to,
            Name: options.to,
          },
        ],
        Subject: options.subject,
        TextPart: options.text,
      },
    ],
  });

  try {
    const result = await request;
    console.log(result.body);
  } catch (error) {
    console.error('Email send failed:', {
      statusCode: error.statusCode,
      message: error.message,
      error: error.ErrorMessage || error.error,
    });
    throw error;
  }
};

module.exports = { sendEmail };

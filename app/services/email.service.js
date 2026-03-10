
const mailJet = require('node-mailjet').apiConnect(
  process.env.EMAIL_USERNAME,
  process.env.EMAIL_PASSWORD
);

const sendEmail = async (options) => {

  const fromEmail =
    process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_FROM_EMAIL;
  const fromName = process.env.EMAIL_FROM_NAME;

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

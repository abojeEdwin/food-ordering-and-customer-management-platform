
const crypto = require('crypto');

const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, expires };
};

const verifyOtp = (providedOtp, storedOtp, expires) => {
  if (new Date() > expires) {
    return false;
  }
  return providedOtp === storedOtp;
};

module.exports = {
  generateOtp,
  verifyOtp,
};

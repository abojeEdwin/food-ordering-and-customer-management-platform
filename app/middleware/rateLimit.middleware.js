
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginLimiter = rateLimit({
  max: 5, // Limit each IP to 5 login requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many login attempts from this IP, please try again in 15 minutes!',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  loginLimiter,
};

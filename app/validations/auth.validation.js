
const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  signupSchema,
  verifyOtpSchema,
  loginSchema,
  resendOtpSchema,
};

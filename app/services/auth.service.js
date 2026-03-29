
const { User, Customer } = require('../model/user.model');
const { generateOtp, verifyOtp } = require('../utils/otp');
const { sendEmail } = require('./email.service');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { redisClient } = require('../config/redis');
const { blacklistToken } = require('./token.service');
const CacheService = require('../services/cache.service');
const AccountAlreadyVerifiedException = require("../exceptions/AccountAlreadyVerifiedException");
const FailedToSendEmailException = require("../exceptions/FailedToSendEmailException");
const UserNotFoundException = require("../exceptions/UserNotFoundException");
const AccountNotActiveException = require("../exceptions/AccountNotActiveException");
const AccountNotVerifiedException = require("../exceptions/AccountNotVerifiedException");
const InvalidCredentialException = require("../exceptions/InvalidCredentialException");
const InvalidOrExpiredOtpException = require("../exceptions/InvalidOrExpiredOtpException");
const AccountAlreadyExistsException = require("../exceptions/AccountAlreadyExistException");
const config = require('../config/env');

const OTP_TTL_SECONDS = config.otpTtlSeconds;
const otpKey = (email) => `otp:${email.toLowerCase()}`;

const signup = async (userData) => {
  const { email, password, phoneNumber} = userData;

  const existingUser = await Customer.findOne({ email });
  if (existingUser) {
    throw new AccountAlreadyExistsException('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { otp } = generateOtp();

  const newUser = await Customer.create({
    email,
    password: hashedPassword,
    phoneNumber: phoneNumber,
    role: 'customer',
  });

  try {
    await CacheService.setJson(otpKey(email),otp,OTP_TTL_SECONDS)
    await sendEmail({
      to: newUser.email,
      subject: 'Verify Your Account',
      text: `Your OTP is: ${otp}`,
    });
  } catch (emailError) {
    await Customer.findByIdAndDelete(newUser._id);
    throw new FailedToSendEmailException('There was an error sending the email. Try again later!', 500);
  }

  const token = generateToken(newUser._id);
  const userResponse = {
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    isVerified: newUser.isVerified,
    isActive: newUser.isActive,
  };
  return { user: userResponse, token };
};

const verifyOtpService = async (email, otp) => {
  const user = await Customer.findOne({ email });

  if (!user) {
    throw new UserNotFoundException('User not found.', 404);
  }

  if (user.isVerified) {
    throw new AccountAlreadyVerifiedException('Account already verified.', 400);
  }

  const cachedOtp = await redisClient.get(otpKey(email));
  const isValidOtp = cachedOtp
    ? cachedOtp === otp
    : verifyOtp(otp, user.otp, user.otpExpires);

  if (!isValidOtp) {
    throw new InvalidOrExpiredOtpException('Invalid or expired OTP.', 400);
  }

  user.isVerified = true;
  user.isActive = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  await CacheService.delByPattern(otpKey(email))

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new InvalidCredentialException('Incorrect email or password', 401);
  }

  if (!user.isVerified) {
    throw new AccountNotVerifiedException('Please verify your account first.', 403);
  }

  if (!user.isActive) {
    throw new AccountNotActiveException('Your account has been deactivated.', 403);
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  const userResponse = {
    id: user._id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
  };
  return { user: userResponse, token };
};

const resendOtp = async (email) => {
  const user = await Customer.findOne({ email });

  if (!user) {
    throw new UserNotFoundException('User not found.', 404);
  }
  if (user.isVerified) {
    throw new AccountAlreadyVerifiedException('Account already verified.', 400);
  }

  const { otp } = generateOtp();
  await CacheService.setJson(otpKey(email), otp, OTP_TTL_SECONDS)
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Account',
      text: `Your OTP is: ${otp}`,
    });
  } catch (emailError) {
    throw new FailedToSendEmailException('There was an error sending the email. Try again later!', 500);
  }
  return { message: 'OTP resent successfully.' };
};

module.exports = {
  signup,
  verifyOtp: verifyOtpService,
  login,
  resendOtp,
  logout: async (token) => {
    await blacklistToken(token);
    return { message: 'Logged out successfully.' };
  },
};

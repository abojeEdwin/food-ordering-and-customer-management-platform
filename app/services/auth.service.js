
const { User, Customer } = require('../model/user.model');
const AppError = require('../utils/appError');
const { generateOtp, verifyOtp } = require('../utils/otp');
const { sendEmail } = require('./email.service');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { redisClient } = require('../config/redis');
const { blacklistToken } = require('./token.service');

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 600);
const otpKey = (email) => `otp:${email.toLowerCase()}`;

const signup = async (userData) => {
  const { email, password, phoneNumber } = userData;

  const existingUser = await Customer.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { otp } = generateOtp();

  const newUser = await Customer.create({
    email,
    password: hashedPassword,
    phoneNumber,
    role: 'customer',
  });

  try {
    await redisClient.set(otpKey(email), otp, { EX: OTP_TTL_SECONDS });
    await sendEmail({
      to: newUser.email,
      subject: 'Verify Your Account',
      text: `Your OTP is: ${otp}`,
    });
  } catch (emailError) {
    await Customer.findByIdAndDelete(newUser._id);
    throw new AppError('There was an error sending the email. Try again later!', 500);
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
    throw new AppError('User not found.', 404);
  }

  if (user.isVerified) {
    throw new AppError('Account already verified.', 400);
  }

  const cachedOtp = await redisClient.get(otpKey(email));
  const isValidOtp = cachedOtp
    ? cachedOtp === otp
    : verifyOtp(otp, user.otp, user.otpExpires);

  if (!isValidOtp) {
    throw new AppError('Invalid or expired OTP.', 400);
  }

  user.isVerified = true;
  user.isActive = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  await redisClient.del(otpKey(email));

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
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your account first.', 403);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403);
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
    throw new AppError('User not found.', 404);
  }

  if (user.isVerified) {
    throw new AppError('Account already verified.', 400);
  }

  const { otp } = generateOtp();
  await redisClient.set(otpKey(email), otp, { EX: OTP_TTL_SECONDS });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Account',
      text: `Your OTP is: ${otp}`,
    });
  } catch (emailError) {
    throw new AppError('There was an error sending the email. Try again later!', 500);
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

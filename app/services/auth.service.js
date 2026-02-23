
const { User, Customer } = require('../model/user.model');
const AppError = require('../utils/appError');
const { generateOtp, verifyOtp } = require('../utils/otp');
const { sendEmail } = require('./email.service');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const signup = async (userData) => {
  const { email, password, phoneNumber } = userData;

  const existingUser = await Customer.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { otp, expires } = generateOtp();

  const newUser = await Customer.create({
    email,
    password: hashedPassword,
    phoneNumber,
    otp,
    otpExpires: expires,
    role: 'customer',
  });

  try {
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

  const isValidOtp = verifyOtp(otp, user.otp, user.otpExpires);

  if (!isValidOtp) {
    throw new AppError('Invalid or expired OTP.', 400);
  }

  user.isVerified = true;
  user.isActive = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

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

  const { otp, expires } = generateOtp();
  user.otp = otp;
  user.otpExpires = expires;
  await user.save();

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
};

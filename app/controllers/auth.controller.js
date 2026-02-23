
const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const signup = catchAsync(async (req, res) => {
  const { user, token } = await authService.signup(req.body);
  res.status(201).json({
    message: 'Signup successful. Please check your email for the verification OTP.',
    user,
    token,
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const user = await authService.verifyOtp(req.body.email, req.body.otp);
  res.status(200).json({
    message: 'Account verified successfully.',
    user,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const { message } = await authService.resendOtp(req.body.email);
  res.status(200).json({
    status: 'success',
    message,
  });
});

module.exports = {
  signup,
  verifyOtp,
  login,
  resendOtp,
};

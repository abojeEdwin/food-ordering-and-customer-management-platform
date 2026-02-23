
const express = require('express');
const router = express.Router();
const { loginLimiter, globalLimiter } = require('../middleware/rateLimit.middleware');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { signupSchema, verifyOtpSchema, loginSchema, resendOtpSchema } = require('../validations/auth.validation');

router.post('/signup', globalLimiter, validate(signupSchema), authController.signup);
router.post('/verify-otp', globalLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/resend-otp', globalLimiter, validate(resendOtpSchema), authController.resendOtp);

module.exports = router;

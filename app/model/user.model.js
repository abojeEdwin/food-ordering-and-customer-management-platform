
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['customer', 'admin'],
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
  },
}, { timestamps: true });

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

const Admin = User.discriminator('Admin', new Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}));

const Customer = User.discriminator('Customer', new Schema({
  address: {
    type: String,
  },
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
}));

module.exports = { User, Admin, Customer };

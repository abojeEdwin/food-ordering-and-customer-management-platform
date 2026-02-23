
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

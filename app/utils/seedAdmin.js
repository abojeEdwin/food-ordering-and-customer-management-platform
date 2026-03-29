
const mongoose = require('mongoose');
const { Admin } = require('../model/user.model');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = config.adminSeed.email;
    const adminPassword = config.adminSeed.password;

    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await Admin.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    console.log('Admin seeded successfully.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();

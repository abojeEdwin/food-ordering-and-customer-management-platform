
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Admin } = require('../model/user.model');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './config/config.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

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

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AdminProfile from '../models/AdminProfile.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sutragram-dev';
const email = 'admin@sutragram.com';
const password = 'Admin@123';

async function run() {
  await mongoose.connect(MONGO_URI);

  let user = await User.findOne({ email });
  if (!user) {
    const password_hash = await bcrypt.hash(password, 10);
    user = await User.create({
      name: 'Admin User',
      email,
      phone_number: '9999999999',
      password_hash,
      role: 'admin',
      is_email_verified: true,
      is_active: true,
    });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  const profile = await AdminProfile.findOne({ user: user._id });
  if (!profile) {
    await AdminProfile.create({
      user: user._id,
      access_level: 'super_admin',
      permissions: ['manage_users', 'moderate_content', 'view_analytics', 'verify_artisans'],
    });
    console.log('Created AdminProfile');
  } else {
    console.log('AdminProfile already exists');
  }

  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  });

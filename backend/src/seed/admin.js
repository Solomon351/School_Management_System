const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  const name = process.env.SEED_ADMIN_NAME && process.env.SEED_ADMIN_NAME.trim();
  const loginId = process.env.SEED_ADMIN_LOGIN_ID && process.env.SEED_ADMIN_LOGIN_ID.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !loginId || !password) {
    throw new Error('Set SEED_ADMIN_NAME, SEED_ADMIN_LOGIN_ID, and SEED_ADMIN_PASSWORD in backend/.env.');
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('SEED_ADMIN_PASSWORD must be no more than 72 bytes.');
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters long.');
  }

  await connectDB();

  if (await User.exists({ role: 'admin' })) {
    console.log('An admin account already exists; no account was created.');
    return;
  }
  if (await User.exists({ loginId: loginId.toUpperCase() })) {
    throw new Error('SEED_ADMIN_LOGIN_ID is already in use by another account.');
  }

  await User.create({
    name,
    loginId,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
    mustChangePassword: true
  });
  console.log('Initial admin account created. Change its password after the first login.');
}

seedAdmin()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });

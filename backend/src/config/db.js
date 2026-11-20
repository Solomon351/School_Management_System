const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Database connection failed: MONGODB_URI is not set in backend/.env.');
    process.exit(1);
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Database connected');
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;

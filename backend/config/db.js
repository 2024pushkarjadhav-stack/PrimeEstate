const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS resolution is restricted
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const errorMsg = 'MONGO_URI environment variable is not defined in backend/.env';
    console.error(`[MongoDB Configuration Error]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Setup connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Warning]: Disconnected from MongoDB Atlas cluster. Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB]: Reconnected to MongoDB Atlas cluster successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB Connection Event Error]: ${err.message}`);
  });

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`[MongoDB Connected]: Successfully established connection to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error('Please verify your MongoDB Atlas connection string in backend/.env and ensure your current IP is whitelisted (0.0.0.0/0).');
    throw error;
  }
};

module.exports = connectDB;


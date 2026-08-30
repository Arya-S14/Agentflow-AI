const mongoose = require('mongoose');
const env = require('./env');

let isInMemoryMode = false;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to ${env.MONGO_URI}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}).`);
    console.warn('[MongoDB Fallback] Operating in lightweight memory store fallback mode for seamless execution.');
    isInMemoryMode = true;
  }
};

const getDBMode = () => (isInMemoryMode ? 'in-memory' : 'mongodb');

module.exports = { connectDB, getDBMode };

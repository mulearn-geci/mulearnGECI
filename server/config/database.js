const mongoose = require('mongoose');

let isConnecting = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    await isConnecting;
    return mongoose.connection.readyState === 1;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://mulearn_db_user:KqUswMcR3edtcZkx@mulearn-cluster.lkod39g.mongodb.net/mulearn?retryWrites=true&w=majority';

  try {
    isConnecting = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: true,
    });

    const conn = await isConnecting;
    isConnecting = null;

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnecting = null;
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = connectDB;
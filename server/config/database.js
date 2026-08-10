const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://mulearn_db_user:KqUswMcR3edtcZkx@mulearn-cluster.lkod39g.mongodb.net/mulearn?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = connectDB;
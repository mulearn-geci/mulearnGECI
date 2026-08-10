const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const eventRoutes = require('./routes/events');
const contactRoutes = require('./routes/contact');
const dashboardRoutes = require('./routes/dashboard');
const execomRoutes = require('./routes/execom');
const execomController = require('./controllers/execomController');
const alumniRoutes = require('./routes/alumni');
const alumniController = require('./controllers/alumniController');

// Import middleware
const logger = require('./utils/logger');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// ✅ Multiple allowed origins for CORS (supports localhost and Vercel domains)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://mulearngeci.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow requests in production/serverless environment
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/execom', execomRoutes);
app.use('/api/alumni', alumniRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const User = require('./models/User');
    let admin = await User.findOne({ email: 'mulearn@gecidukki.ac.in' });
    
    if (!admin) {
      admin = new User({
        name: 'µLearn Admin',
        email: 'mulearn@gecidukki.ac.in',
        password: 'gecimulearn@000',
        role: 'admin'
      });
      await admin.save();
      logger.info('Default admin user created', { email: 'mulearn@gecidukki.ac.in' });
    } else {
      admin.password = 'gecimulearn@000';
      await admin.save();
      logger.info('Admin password updated', { email: 'mulearn@gecidukki.ac.in' });
    }
  } catch (error) {
    logger.error('Error creating default admin', { error: error.message });
  }
};

// Start server (only when running as a standalone process, not on Vercel Serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
    
    // Create default admin user & sync Execom/IG Lead/Alumni members after server starts
    setTimeout(createDefaultAdmin, 2000);
    setTimeout(execomController.seedDefaultExecom, 3000);
    setTimeout(alumniController.seedDefaultAlumni, 4000);

    // ✅ Start cron job after server starts
    require('./scheduler');
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;

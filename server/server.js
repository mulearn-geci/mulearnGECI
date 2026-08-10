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

// Trust proxy for Vercel / reverse proxy deployment
app.set('trust proxy', 1);

// Health check endpoint (placed before DB middleware for fast responses)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbConnected: mongoose.connection.readyState >= 1
  });
});

// Connect to MongoDB & ensure connection on serverless requests
connectDB();
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await connectDB();
  } catch (err) {
    console.error('DB middleware connection error:', err.message);
  }
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  validate: { trustProxy: false },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

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
  try {
    const clientIp = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '';
    logger.info(`${req.method} ${req.path}`, {
      ip: clientIp,
      userAgent: req.get('User-Agent') || ''
    });
  } catch (err) {
    // Ignore logging errors in serverless
  }
  next();
});

// API Routes (supports both /api/* and /* for Vercel serverless functions)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/posts', '/posts'], postRoutes);
app.use(['/api/events', '/events'], eventRoutes);
app.use(['/api/contact', '/contact'], contactRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);
app.use(['/api/execom', '/execom'], execomRoutes);
app.use(['/api/alumni', '/alumni'], alumniRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbConnected: mongoose.connection.readyState >= 1
  });
});

// 404 handler for API routes
app.use((req, res) => {
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

// Graceful shutdown (only when running standalone server)
if (!process.env.VERCEL) {
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

module.exports = app;

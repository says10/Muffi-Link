/// <reference path="./types/environment.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from './utils/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import creditRoutes from './routes/credits';
import moodboardRoutes from './routes/moodboard';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import loveNoteRoutes from './routes/loveNoteRoutes';
import memoryRoutes from './routes/memoryRoutes';
import grievanceRoutes from './routes/grievanceRoutes';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later. 💕'
  }
});
app.use('/api/', limiter);

// CORS configuration - allow all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Muffi-Link backend is running smoothly! 💕',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/moodboards', moodboardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/love-notes', loveNoteRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/grievances', grievanceRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Muffi-Link API! 💕',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'Running'
  });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found 💔`
    });
  });
}

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`
🌹 Muffi-Link Backend Server Started 🌹
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💕 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV}
🔗 Frontend URL: ${process.env.FRONTEND_URL}
💝 Ready to connect couples around the world!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('💔 Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('💔 Uncaught Exception:', err.message);
  process.exit(1);
});

export default app;

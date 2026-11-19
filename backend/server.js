const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Express app
const app = express();


// Security Middleware: Helmet
app.use(helmet());

// Security Middleware: CORS
const { corsOptions } = require('./config/cors');
app.use(cors(corsOptions));

// Security Middleware: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in 15 minutes',
  },
});
app.use('/api', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PrimeEstate REST API is active and running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      properties: '/api/properties',
      leads: '/api/leads',
      appointments: '/api/appointments',
      users: '/api/users',
    },
    docs: 'See backend/POSTMAN_TESTING.md for API testing instructions',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: 'PrimeEstate API is operational',
    database: isDbConnected ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// 404 Not Found Middleware
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

const http = require('http');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express
const httpServer = http.createServer(app);

// Initialize Socket.IO instance
initSocket(httpServer);

// Start server asynchronously after attempting database connection
const startServer = async () => {
  try {
    await connectDB();
    console.log('[PrimeEstate DB]: Database connected and ready.');
  } catch (dbErr) {
    console.error('[PrimeEstate DB Warning]: Starting server with degraded database connectivity:', dbErr.message);
  }

  httpServer.listen(PORT, () => {
    console.log(
      `[PrimeEstate Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
    console.log(`[API Base]: http://localhost:${PORT}/api`);
    console.log(`[WebSocket]: ws://localhost:${PORT} (Socket.IO active)`);
  });
};

startServer();


// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Keep server running in development for resilience
});

module.exports = { app, httpServer };

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require('socket.io');

// Import configurations
const config = require('./config/index.config');
const connectDB = require('./config/database.config');
const routes = require('./routes/index.routes');
const { globalErrorHandler, notFoundHandler } = require('./middleware/error.middleware');
const AppError = require('./utils/appError');
const socketService = require('./services/socket.service');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: config.frontendUrl,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Initialize socket service
socketService.initialize(io);

// ============================================
// Database Connection
// ============================================
connectDB();

// ============================================
// Security Middleware
// ============================================

// Helmet: Set security HTTP headers
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: config.frontendUrl,
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// Body Parsers & Cookie Parser
// ============================================
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// ============================================
// Logging
// ============================================
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// ============================================
// API Routes
// ============================================
app.use(`/api`, routes);

// ============================================
// Error Handling
// ============================================

// 404 Handler - Must come after all other routes
app.use(notFoundHandler);

// Global Error Handler - Must be last middleware
app.use(globalErrorHandler);

// ============================================
// Start Server
// ============================================
const PORT = config.port;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running in ${config.env.toUpperCase()} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const applicationRoutes = require('./application.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/applications', applicationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Event Platform API'
  });
});

module.exports = router;

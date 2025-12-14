const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const organisationRoutes = require('./organisation.routes');
const eventRoutes = require('./event.routes');
const userRoutes = require('./user.routes');
const applicationRoutes = require('./application.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/organisations', organisationRoutes);
router.use('/events', eventRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Conevent API'
  });
});

module.exports = router;

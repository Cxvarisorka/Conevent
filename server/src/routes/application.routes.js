/**
 * Application Routes
 *
 * Routes for event application management:
 * - POST /applications - Create application (authenticated users)
 * - GET /applications/my - Get user's own applications
 * - GET /applications/admin - Get all applications (admin only)
 * - GET /applications/organisation - Get org applications (org admins)
 * - GET /applications/:id - Get single application
 * - GET /applications/stats/:eventId - Get event application stats
 * - PATCH /applications/:id/status - Accept/reject application
 * - PATCH /applications/:id/cancel - Cancel own application
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { auth, allowedTo } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(auth);

// User routes
router.post('/', applicationController.createApplication);
router.get('/my', applicationController.getMyApplications);
router.patch('/:id/cancel', applicationController.cancelApplication);

// Organisation admin routes
router.get(
    '/organisation',
    allowedTo('organisation', 'admin'),
    applicationController.getOrganisationApplications
);

// Admin routes
router.get(
    '/admin',
    allowedTo('admin'),
    applicationController.getAdminApplications
);

// Shared routes (with role-based logic in controller)
router.get('/stats/:eventId', applicationController.getEventApplicationStats);
router.get('/:id', applicationController.getApplication);
router.patch(
    '/:id/status',
    allowedTo('organisation', 'admin'),
    applicationController.updateApplicationStatus
);

module.exports = router;

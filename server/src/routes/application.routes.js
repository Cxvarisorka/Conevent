const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { requireStudent, requireUniversity } = require('../middleware/auth.middleware');

// ============================================
// Student Routes - Student Role Required
// ============================================

/**
 * @route   GET /api/v1/applications/my
 * @desc    Get my applications (student's applications)
 * @access  Private (Student only)
 * @middleware requireStudent - Verifies auth + student role
 */
router.get('/my', requireStudent, applicationController.getMyApplications);

/**
 * @route   POST /api/v1/applications/:eventId
 * @desc    Apply to an event
 * @access  Private (Student only)
 * @middleware requireStudent - Verifies auth + student role
 */
router.post('/:eventId', requireStudent, applicationController.applyToEvent);

/**
 * @route   DELETE /api/v1/applications/:id
 * @desc    Delete/Cancel application
 * @access  Private (Student only - must be application owner)
 * @middleware requireStudent - Verifies auth + student role
 * @note    Additional ownership check in controller
 */
router.delete('/:id', requireStudent, applicationController.deleteApplication);

// ============================================
// University Routes - University Role Required
// ============================================

/**
 * @route   GET /api/v1/applications/event/:eventId
 * @desc    Get applications for an event
 * @access  Private (University only - must be event owner)
 * @middleware requireUniversity - Verifies auth + university role
 * @note    Additional ownership check in controller
 */
router.get('/event/:eventId', requireUniversity, applicationController.getEventApplications);

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @desc    Update application status (accept/reject)
 * @access  Private (University only - must own the event)
 * @middleware requireUniversity - Verifies auth + university role
 * @note    Additional ownership check in controller
 */
router.patch('/:id/status', requireUniversity, applicationController.updateApplicationStatus);

module.exports = router;

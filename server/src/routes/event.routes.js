const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { requireUniversity } = require('../middleware/auth.middleware');
const { uploadEventImages } = require('../middleware/upload.middleware');

// ============================================
// Public Routes - No Authentication Required
// ============================================

/**
 * @route   GET /api/v1/events
 * @desc    Get all events (public listing)
 * @access  Public
 */
router.get('/', eventController.getEvents);

// ============================================
// Protected Routes - University Only
// ============================================

/**
 * @route   GET /api/v1/events/my
 * @desc    Get my events (university's own events)
 * @access  Private (University only)
 * @middleware requireUniversity - Verifies auth + university role
 * @note    Must be defined BEFORE /:id route to avoid route conflict
 */
router.get('/my', requireUniversity, eventController.getMyEvents);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get single event by ID
 * @access  Public
 * @note    Must be defined AFTER /my route to avoid route conflict
 */
router.get('/:id', eventController.getEvent);

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Private (University only)
 * @middleware requireUniversity - Verifies auth + university role
 * @middleware uploadEventImages - Handles image uploads (max 4 images)
 */
router.post('/', requireUniversity, uploadEventImages, eventController.createEvent);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update event
 * @access  Private (University only - must be event owner)
 * @middleware requireUniversity - Verifies auth + university role
 * @middleware uploadEventImages - Handles image uploads (max 4 images)
 * @note    Additional ownership check in controller
 */
router.put('/:id', requireUniversity, uploadEventImages, eventController.updateEvent);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete event
 * @access  Private (University only - must be event owner)
 * @middleware requireUniversity - Verifies auth + university role
 * @note    Additional ownership check in controller
 */
router.delete('/:id', requireUniversity, eventController.deleteEvent);

module.exports = router;

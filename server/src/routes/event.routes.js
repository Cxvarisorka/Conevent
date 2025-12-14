const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { auth, canManageEvent } = require('../middleware/auth.middleware');
const { uploadEventImages } = require('../middleware/upload.middleware');

// Public Routes - Anyone can view events
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Protected Routes - Admins and organisation admins can create, update, delete events
router.post('/', auth, canManageEvent, uploadEventImages, eventController.createEvent);
router.put('/:id', auth, canManageEvent, eventController.updateEvent);
router.delete('/:id', auth, canManageEvent, eventController.deleteEvent);

module.exports = router;
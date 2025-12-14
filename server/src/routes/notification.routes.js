/**
 * Notification Routes
 *
 * All routes require authentication
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../controllers/notification.controller');

// All routes require authentication
router.use(auth);

// Get my notifications
router.get('/', getMyNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;

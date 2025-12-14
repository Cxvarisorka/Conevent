/**
 * Notification Helper
 *
 * Utility functions to create notifications and emit them in real-time
 */

const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const socketService = require('../services/socket.service');

/**
 * Create a notification and emit it via Socket.io
 * @param {Object} options
 * @param {string} options.recipientId - User ID to receive notification
 * @param {string} options.type - Notification type
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.relatedEvent] - Related event ID
 * @param {string} [options.relatedApplication] - Related application ID
 */
const createAndEmit = async ({
    recipientId,
    type,
    title,
    message,
    relatedEvent,
    relatedApplication,
}) => {
    // Create notification in DB
    const notification = await Notification.create({
        recipientId,
        type,
        title,
        message,
        relatedEvent,
        relatedApplication,
    });

    // Emit to user if online
    socketService.emitToUser(recipientId, 'notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedEvent: notification.relatedEvent,
        relatedApplication: notification.relatedApplication,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
    });

    return notification;
};

/**
 * Notify all users about a new event
 * @param {Object} event - The event object
 * @param {Object} organisation - The organisation object
 */
const notifyNewEvent = async (event, organisation) => {
    // Get all active users
    const users = await User.find({ isActive: true }).select('_id');

    // Create notifications for all users
    const notifications = users.map((user) => ({
        recipientId: user._id,
        type: 'new_event',
        title: 'New Event',
        message: `${organisation.name} just published "${event.title}"`,
        relatedEvent: event._id,
    }));

    // Bulk insert notifications
    await Notification.insertMany(notifications);

    // Emit to all connected users
    socketService.emitToAll('new_event', {
        type: 'new_event',
        title: 'New Event',
        message: `${organisation.name} just published "${event.title}"`,
        event: {
            _id: event._id,
            title: event.title,
            coverImage: event.coverImage,
            startDate: event.startDate,
            organisationName: organisation.name,
        },
    });
};

/**
 * Notify organisation admins about a new application
 * @param {Object} application - The application object (populated)
 * @param {Array} adminIds - Array of admin user IDs
 */
const notifyNewApplication = async (application, adminIds) => {
    const notifications = adminIds.map((adminId) => ({
        recipientId: adminId,
        type: 'application_received',
        title: 'New Application',
        message: `${application.userId.name} applied to "${application.eventId.title}"`,
        relatedEvent: application.eventId._id,
        relatedApplication: application._id,
    }));

    // Bulk insert notifications
    await Notification.insertMany(notifications);

    // Emit to each admin
    adminIds.forEach((adminId) => {
        socketService.emitToUser(adminId, 'notification', {
            type: 'application_received',
            title: 'New Application',
            message: `${application.userId.name} applied to "${application.eventId.title}"`,
            relatedEvent: application.eventId._id,
            relatedApplication: application._id,
            createdAt: new Date(),
        });
    });
};

/**
 * Notify user about application status change
 * @param {Object} application - The application object (populated)
 * @param {string} status - 'accepted' or 'rejected'
 */
const notifyApplicationStatus = async (application, status) => {
    const isAccepted = status === 'accepted';

    const notification = await Notification.create({
        recipientId: application.userId._id || application.userId,
        type: isAccepted ? 'application_accepted' : 'application_rejected',
        title: isAccepted ? 'Application Accepted' : 'Application Rejected',
        message: isAccepted
            ? `Congratulations! You've been accepted to "${application.eventId.title}"`
            : `Your application to "${application.eventId.title}" was not accepted`,
        relatedEvent: application.eventId._id || application.eventId,
        relatedApplication: application._id,
    });

    // Emit to user
    socketService.emitToUser(application.userId._id || application.userId, 'notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedEvent: notification.relatedEvent,
        relatedApplication: notification.relatedApplication,
        isRead: false,
        createdAt: notification.createdAt,
    });

    return notification;
};

module.exports = {
    createAndEmit,
    notifyNewEvent,
    notifyNewApplication,
    notifyApplicationStatus,
};

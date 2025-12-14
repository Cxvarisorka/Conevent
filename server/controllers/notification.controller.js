/**
 * Notification Controller
 *
 * Handles notification-related operations:
 * - Get user's notifications
 * - Mark as read
 * - Get unread count
 */

const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Get current user's notifications
 * GET /api/notifications
 */
const getMyNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('relatedEvent', 'title coverImage startDate')
        .lean();

    const total = await Notification.countDocuments({ recipientId: userId });

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            notifications,
        },
    });
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
    });

    res.status(200).json({
        status: 'success',
        data: {
            count,
        },
    });
});

/**
 * Mark a notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipientId: userId },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            notification,
        },
    });
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
    });
});

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
        _id: id,
        recipientId: userId,
    });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};

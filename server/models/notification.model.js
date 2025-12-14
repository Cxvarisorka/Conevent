/**
 * Notification Model
 *
 * Stores notifications for users (real-time + persistent)
 * Used for: new events, application updates, etc.
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // Who receives this notification
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Notification type
        type: {
            type: String,
            enum: [
                'new_event',
                'application_received',
                'application_accepted',
                'application_rejected',
            ],
            required: true,
        },

        // Notification content
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },

        // Related entities (optional)
        relatedEvent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
        },
        relatedApplication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        },

        // Read status
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

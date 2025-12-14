/**
 * Application Model
 *
 * Represents a user's application/registration to attend an event
 * Tracks application status and allows organisers to manage registrations
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        // User who submitted the application
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Application must belong to a user'],
            index: true,
        },

        // Event being applied to
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Application must be for an event'],
            index: true,
        },

        // Application status
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'cancelled'],
            default: 'pending',
            index: true,
        },

        // Optional message from applicant
        message: {
            type: String,
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },

        // Reason for rejection (if rejected)
        rejectionReason: {
            type: String,
            maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
        },

        // Who processed the application (admin or org admin)
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // When the application was processed
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries (not unique - allows re-apply after cancel)
applicationSchema.index({ userId: 1, eventId: 1 });

// Index for efficient queries
applicationSchema.index({ eventId: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });

/**
 * Pre-save middleware to set processedAt when status changes
 */
applicationSchema.pre('save', function (next) {
    if (this.isModified('status') && ['accepted', 'rejected'].includes(this.status)) {
        this.processedAt = new Date();
    }
    next();
});

/**
 * Static method to check if user already applied to an event
 */
applicationSchema.statics.hasApplied = async function (userId, eventId) {
    const application = await this.findOne({
        userId,
        eventId,
        status: { $ne: 'cancelled' },
    });
    return !!application;
};

/**
 * Static method to get application count by status for an event
 */
applicationSchema.statics.getEventStats = async function (eventId) {
    const stats = await this.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    return stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

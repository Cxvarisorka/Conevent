/**
 * Application Controller
 *
 * Handles event application/registration operations:
 * - Users: Create, view own, cancel applications
 * - Organisers: View applications for their events, accept/reject (free events)
 * - Admins: View all applications, accept/reject any
 */

const Application = require('../models/application.model');
const Event = require('../models/event.model');
const Organisation = require('../models/organisation.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { notifyNewApplication, notifyApplicationStatus } = require('../utils/notificationHelper');

// Rate limit: max applications per day to prevent spam
const MAX_APPLICATIONS_PER_DAY = 5;

/**
 * Create a new application (user applies to event)
 * POST /api/applications
 */
const createApplication = catchAsync(async (req, res, next) => {
    const { eventId, message } = req.body;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    // Check if event is published
    if (event.status !== 'published') {
        return next(new AppError('Cannot apply to this event', 400));
    }

    // Check if registration is still open
    if (event.registrationEndDate && new Date(event.registrationEndDate) < new Date()) {
        return next(new AppError('Registration deadline has passed', 400));
    }

    // Check daily application limit (prevent spam)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const applicationsToday = await Application.countDocuments({
        userId,
        createdAt: { $gte: todayStart },
    });
    if (applicationsToday >= MAX_APPLICATIONS_PER_DAY) {
        return next(
            new AppError(
                'You have reached the maximum of 5 applications per day. Please try again tomorrow.',
                429
            )
        );
    }

    // Check capacity
    if (event.capacity) {
        const acceptedCount = await Application.countDocuments({
            eventId,
            status: 'accepted',
        });
        if (acceptedCount >= event.capacity) {
            return next(new AppError('Event is at full capacity', 400));
        }
    }

    // Check if user already has an active application (not cancelled)
    const existingApplication = await Application.findOne({
        userId,
        eventId,
        status: { $ne: 'cancelled' },
    });

    if (existingApplication) {
        return next(new AppError('You have already applied to this event', 400));
    }

    // Create application
    // Paid events are automatically accepted, free events need org approval
    const application = await Application.create({
        userId,
        eventId,
        message,
        status: event.price && event.price > 0 ? 'accepted' : 'pending',
    });

    // Populate for response
    await application.populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'title startDate organisationId' },
    ]);

    // Notify org admins for free events (pending applications need review)
    if (application.status === 'pending') {
        const organisation = await Organisation.findById(event.organisationId).select('admins');
        if (organisation && organisation.admins && organisation.admins.length > 0) {
            notifyNewApplication(application, organisation.admins).catch(err => {
                console.error('Error sending application notification:', err);
            });
        }
    }

    res.status(201).json({
        status: 'success',
        data: {
            application,
        },
    });
});

/**
 * Get current user's applications
 * GET /api/applications/my
 */
const getMyApplications = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const features = new APIFeatures(
        Application.find({ userId }),
        req.query
    )
        .filter()
        .sort()
        .paginate();

    const applications = await features.query.populate([
        { path: 'eventId', select: 'title startDate endDate status coverImage organisationId price', populate: { path: 'organisationId', select: 'name' } },
    ]);

    // Get total count
    const total = await Application.countDocuments({ userId });

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    res.status(200).json({
        status: 'success',
        results: applications.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            applications,
        },
    });
});

/**
 * Get applications for admin (all applications)
 * GET /api/applications/admin
 */
const getAdminApplications = catchAsync(async (req, res, next) => {
    const { status, eventId, userId } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (eventId) filter.eventId = eventId;
    if (userId) filter.userId = userId;

    // Get total count
    const totalQuery = new APIFeatures(Application.find(filter), req.query)
        .filter()
        .search();
    const total = await Application.countDocuments(totalQuery.query.getFilter());

    // Execute query
    const features = new APIFeatures(Application.find(filter), req.query)
        .filter()
        .sort()
        .paginate();

    const applications = await features.query.populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'title startDate status price organisationId', populate: { path: 'organisationId', select: 'name' } },
        { path: 'processedBy', select: 'name' },
    ]);

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    res.status(200).json({
        status: 'success',
        results: applications.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            applications,
        },
    });
});

/**
 * Get applications for organisation admin
 * GET /api/applications/organisation
 */
const getOrganisationApplications = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { status, eventId } = req.query;

    // Find organisations where user is admin
    const organisations = await Organisation.find({ admins: userId });
    const orgIds = organisations.map((org) => org._id);

    if (orgIds.length === 0) {
        return res.status(200).json({
            status: 'success',
            results: 0,
            total: 0,
            page: 1,
            totalPages: 0,
            data: {
                applications: [],
            },
        });
    }

    // Find events belonging to these organisations
    const events = await Event.find({ organisationId: { $in: orgIds } });
    const eventIds = events.map((event) => event._id);

    // Build filter
    const filter = { eventId: { $in: eventIds } };
    if (status && status !== 'all') filter.status = status;
    if (eventId) filter.eventId = eventId;

    // Get total count
    const total = await Application.countDocuments(filter);

    // Execute query
    const features = new APIFeatures(Application.find(filter), req.query)
        .sort()
        .paginate();

    const applications = await features.query.populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'title startDate status price organisationId', populate: { path: 'organisationId', select: 'name' } },
        { path: 'processedBy', select: 'name' },
    ]);

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    res.status(200).json({
        status: 'success',
        results: applications.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            applications,
        },
    });
});

/**
 * Update application status (accept/reject)
 * PATCH /api/applications/:id/status
 */
const updateApplicationStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const processedBy = req.user._id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
        return next(new AppError('Status must be accepted or rejected', 400));
    }

    const application = await Application.findById(id).populate({
        path: 'eventId',
        select: 'price organisationId',
        populate: { path: 'organisationId', select: 'admins' },
    });

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    // Check if already processed
    if (application.status !== 'pending') {
        return next(new AppError('Application has already been processed', 400));
    }

    // Authorization check for organisation role
    if (req.user.role === 'organisation') {
        const orgAdmins = application.eventId?.organisationId?.admins || [];
        const isOrgAdmin = orgAdmins.some(
            (admin) => admin.toString() === req.user._id.toString()
        );

        if (!isOrgAdmin) {
            return next(new AppError('You are not authorized to process this application', 403));
        }

        // Organisation admins can only process free events
        if (application.eventId.price && application.eventId.price > 0) {
            return next(new AppError('Only admins can process paid event applications', 403));
        }
    }

    // Check capacity for acceptance
    if (status === 'accepted' && application.eventId) {
        const event = await Event.findById(application.eventId._id);
        if (event.capacity) {
            const acceptedCount = await Application.countDocuments({
                eventId: event._id,
                status: 'accepted',
            });
            if (acceptedCount >= event.capacity) {
                return next(new AppError('Event is at full capacity', 400));
            }
        }
    }

    // Update application
    application.status = status;
    application.processedBy = processedBy;
    if (status === 'rejected' && rejectionReason) {
        application.rejectionReason = rejectionReason;
    }
    await application.save();

    // Repopulate for response
    await application.populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'title startDate status price organisationId', populate: { path: 'organisationId', select: 'name' } },
        { path: 'processedBy', select: 'name' },
    ]);

    // Notify user about application status change
    notifyApplicationStatus(application, status).catch(err => {
        console.error('Error sending application status notification:', err);
    });

    res.status(200).json({
        status: 'success',
        data: {
            application,
        },
    });
});

/**
 * Cancel application (user cancels their own application)
 * - Paid events: mark as "cancelled" (kept in DB for records)
 * - Free events: delete completely from DB
 * PATCH /api/applications/:id/cancel
 */
const cancelApplication = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const application = await Application.findById(id).populate({
        path: 'eventId',
        select: 'title startDate price',
    });

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    // Check ownership
    if (application.userId.toString() !== userId.toString()) {
        return next(new AppError('You can only cancel your own applications', 403));
    }

    // Check if can be cancelled (pending or accepted for paid events)
    if (!['pending', 'accepted'].includes(application.status)) {
        return next(new AppError('This application cannot be cancelled', 400));
    }

    const eventTitle = application.eventId.title;
    const isPaidEvent = application.eventId.price && application.eventId.price > 0;

    if (isPaidEvent) {
        // Paid event: mark as cancelled (keep in DB)
        application.status = 'cancelled';
        await application.save();

        res.status(200).json({
            status: 'success',
            message: `Application for "${eventTitle}" has been cancelled`,
            data: {
                application,
            },
        });
    } else {
        // Free event: delete completely
        await Application.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: `Application for "${eventTitle}" has been removed`,
            data: null,
        });
    }
});

/**
 * Get application by ID
 * GET /api/applications/:id
 */
const getApplication = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const application = await Application.findById(id).populate([
        { path: 'userId', select: 'name email' },
        { path: 'eventId', select: 'title startDate status price organisationId', populate: { path: 'organisationId', select: 'name' } },
        { path: 'processedBy', select: 'name' },
    ]);

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            application,
        },
    });
});

/**
 * Get application statistics for an event
 * GET /api/applications/stats/:eventId
 */
const getEventApplicationStats = catchAsync(async (req, res, next) => {
    const { eventId } = req.params;

    const stats = await Application.getEventStats(eventId);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

module.exports = {
    createApplication,
    getMyApplications,
    getAdminApplications,
    getOrganisationApplications,
    updateApplicationStatus,
    cancelApplication,
    getApplication,
    getEventApplicationStats,
};

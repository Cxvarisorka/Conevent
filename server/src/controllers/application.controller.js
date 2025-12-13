const Application = require('../models/application.model');
const Event = require('../models/event.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Apply to an event
 * @route   POST /api/v1/applications/:eventId
 * @access  Private (Student only)
 */
exports.applyToEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check if already applied
  const existing = await Application.findOne({
    eventId,
    studentId: req.user._id
  });

  if (existing) {
    return next(new AppError('Already applied to this event', 400));
  }

  // Create application
  const application = await Application.create({
    eventId,
    studentId: req.user._id
  });

  res.status(201).json({
    success: true,
    application
  });
});

/**
 * @desc    Get my applications (student's applications)
 * @route   GET /api/v1/applications/my
 * @access  Private (Student only)
 */
exports.getMyApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.find({ studentId: req.user._id })
    .populate({
      path: 'eventId',
      populate: { path: 'universityId', select: 'name logo' }
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    applications
  });
});

/**
 * @desc    Get applications for an event
 * @route   GET /api/v1/applications/event/:eventId
 * @access  Private (University owner only)
 */
exports.getEventApplications = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  // Check if event exists and belongs to university
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  if (event.universityId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to view these applications', 403));
  }

  // Get applications
  const applications = await Application.find({ eventId })
    .populate('studentId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    applications
  });
});

/**
 * @desc    Update application status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (University owner only)
 */
exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status. Must be pending, accepted, or rejected', 400));
  }

  // Find application
  const application = await Application.findById(id).populate('eventId');
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  // Check if university owns the event
  if (application.eventId.universityId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this application', 403));
  }

  // Update status
  application.status = status;
  await application.save();

  res.json({
    success: true,
    application
  });
});

/**
 * @desc    Delete/Cancel application
 * @route   DELETE /api/v1/applications/:id
 * @access  Private (Student owner only)
 */
exports.deleteApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  // Check if student owns this application
  if (application.studentId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this application', 403));
  }

  // Only allow deletion if status is pending
  if (application.status !== 'pending') {
    return next(new AppError('Cannot delete accepted/rejected applications', 400));
  }

  await application.deleteOne();

  res.json({
    success: true,
    message: 'Application deleted'
  });
});

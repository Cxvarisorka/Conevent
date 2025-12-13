const Event = require('../models/event.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { cloudinary } = require('../config/cloudinary.config');

/**
 * @desc    Get all events
 * @route   GET /api/v1/events
 * @access  Public
 */
exports.getEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find()
    .populate('universityId', 'name logo')
    .sort({ date: 1 });

  res.json({
    success: true,
    events
  });
});

/**
 * @desc    Get single event by ID
 * @route   GET /api/v1/events/:id
 * @access  Public
 */
exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('universityId', 'name logo');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.json({
    success: true,
    event
  });
});

/**
 * @desc    Create new event
 * @route   POST /api/v1/events
 * @access  Private (University only)
 */
exports.createEvent = catchAsync(async (req, res, next) => {
  const { title, description, date, location } = req.body;

  if (!title || !description || !date || !location) {
    return next(new AppError('Please provide all required fields: title, description, date, location', 400));
  }

  // Extract image URLs from uploaded files
  const images = req.files ? req.files.map(file => file.path) : [];

  // Validate maximum 4 images
  if (images.length > 4) {
    // Delete uploaded images if more than 4
    for (const imageUrl of images) {
      try {
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
          const publicId = pathAfterUpload.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }
    return next(new AppError('Maximum 4 images allowed per event', 400));
  }

  const event = await Event.create({
    universityId: req.user._id,
    title,
    description,
    date,
    location,
    images
  });

  res.status(201).json({
    success: true,
    event
  });
});

/**
 * @desc    Update event
 * @route   PUT /api/v1/events/:id
 * @access  Private (University owner only)
 */
exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check if university owns this event
  if (event.universityId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this event', 403));
  }

  const { title, description, date, location, imagesToDelete } = req.body;

  // Handle image updates
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => file.path);
    const currentImages = event.images || [];
    
    // Combine existing images with new ones
    let updatedImages = [...currentImages, ...newImages];
    
    // Remove images that are marked for deletion
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      // Delete images from Cloudinary
      for (const imageUrl of imagesToDelete) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = imageUrl.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            const publicId = pathAfterUpload.split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
      // Remove from array
      updatedImages = updatedImages.filter(img => !imagesToDelete.includes(img));
    }
    
    // Validate maximum 4 images
    if (updatedImages.length > 4) {
      // Delete newly uploaded images if exceeding limit
      for (const imageUrl of newImages) {
        try {
          const urlParts = imageUrl.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            const publicId = pathAfterUpload.split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
      return next(new AppError('Maximum 4 images allowed per event', 400));
    }
    
    event.images = updatedImages;
  } else if (imagesToDelete && Array.isArray(imagesToDelete)) {
    // Only delete images, no new uploads
    for (const imageUrl of imagesToDelete) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`events/${publicId}`);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }
    event.images = (event.images || []).filter(img => !imagesToDelete.includes(img));
  }

  event.title = title || event.title;
  event.description = description || event.description;
  event.date = date || event.date;
  event.location = location || event.location;

  await event.save();

  res.json({
    success: true,
    event
  });
});

/**
 * @desc    Delete event
 * @route   DELETE /api/v1/events/:id
 * @access  Private (University owner only)
 */
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check if university owns this event
  if (event.universityId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this event', 403));
  }

  // Delete images from Cloudinary
  if (event.images && event.images.length > 0) {
    for (const imageUrl of event.images) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/events/filename.jpg
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          // Get everything after 'upload' and before the file extension
          const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
          const publicId = pathAfterUpload.split('.')[0]; // Remove file extension
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }
  }

  await event.deleteOne();

  res.json({
    success: true,
    message: 'Event deleted'
  });
});

/**
 * @desc    Get my events (university's own events)
 * @route   GET /api/v1/events/my
 * @access  Private (University only)
 */
exports.getMyEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ universityId: req.user._id })
    .sort({ date: 1 });

  res.json({
    success: true,
    events
  });
});

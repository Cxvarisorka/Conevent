const catchAsync = require("../utils/catchAsync");
const Event = require("../models/event.model");
const Organisation = require("../models/organisation.model");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");
const { notifyNewEvent } = require("../utils/notificationHelper");

// Create a new event
const createEvent = catchAsync(async (req, res, next) => {
    const {
        title,
        description,
        organisationId,
        category,
        eventType,
        onlineLink,
        street,
        address,
        city,
        startDate,
        endDate,
        registrationStartDate,
        registrationEndDate,
        capacity,
        isFree,
        price,
        currency,
        tags,
        status,
        requirements,
        contactEmail,
        contactPhone
    } = req.body;

    // Handle image uploads to Cloudinary
    let coverImageUrl = null;
    let imageUrls = [];

    if (req.files) {
        // Upload cover image if provided
        if (req.files.coverImage && req.files.coverImage[0]) {
            coverImageUrl = await uploadToCloudinary(req.files.coverImage[0].buffer, 'conevent/events');
        }

        // Upload multiple images if provided
        if (req.files.images && req.files.images.length > 0) {
            const uploadPromises = req.files.images.map(file =>
                uploadToCloudinary(file.buffer, 'conevent/events')
            );
            imageUrls = await Promise.all(uploadPromises);
        }
    }

    // Create event
    const event = await Event.create({
        title,
        description,
        organisationId,
        category,
        coverImage: coverImageUrl,
        images: imageUrls,
        eventType,
        onlineLink,
        street,
        address,
        city,
        startDate,
        endDate,
        registrationStartDate,
        registrationEndDate,
        capacity,
        isFree,
        price,
        currency,
        tags,
        status,
        requirements,
        contactEmail,
        contactPhone
    });

    // Notify all users if event is published
    if (status === 'published') {
        const organisation = await Organisation.findById(organisationId).select('name');
        if (organisation) {
            notifyNewEvent(event, organisation).catch(err => {
                console.error('Error sending new event notifications:', err);
            });
        }
    }

    res.status(201).json({
        status: "success",
        data: {
            event
        }
    });
});

// Get all events with filtering, sorting, and pagination
const getAllEvents = catchAsync(async (req, res, next) => {
    // Search fields for events
    const searchFields = ['title', 'description'];

    // Get total count for pagination
    const totalQuery = new APIFeatures(Event.find(), req.query)
        .filter()
        .search(searchFields);
    const total = await Event.countDocuments(totalQuery.query.getFilter());

    // Execute query with all features
    const features = new APIFeatures(Event.find(), req.query)
        .filter()
        .search(searchFields)
        .sort()
        .limitFields()
        .paginate();

    const events = await features.query.populate('organisationId', 'name type logo');

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    res.status(200).json({
        status: "success",
        results: events.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            events
        }
    });
});

// Get single event by ID
const getEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const event = await Event.findById(id).populate('organisationId', 'name type logo email phone website');

    if (!event) {
        return next(new AppError("Event not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            event
        }
    });
});

// Update event by ID
const updateEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Get old event to check if status is changing to published
    const oldEvent = await Event.findById(id);
    if (!oldEvent) {
        return next(new AppError("Event not found", 404));
    }

    const event = await Event.findByIdAndUpdate(
        id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    // Notify all users if event is being published (status changed to published)
    if (req.body.status === 'published' && oldEvent.status !== 'published') {
        const organisation = await Organisation.findById(event.organisationId).select('name');
        if (organisation) {
            notifyNewEvent(event, organisation).catch(err => {
                console.error('Error sending new event notifications:', err);
            });
        }
    }

    res.status(200).json({
        status: "success",
        data: {
            event
        }
    });
});

// Delete event by ID
const deleteEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
        return next(new AppError("Event not found", 404));
    }

    // Delete images from Cloudinary if they exist
    if (event.coverImage) {
        try {
            await deleteFromCloudinary(event.coverImage);
        } catch (error) {
            console.error('Error deleting cover image from Cloudinary:', error);
        }
    }

    if (event.images && event.images.length > 0) {
        try {
            const deletePromises = event.images.map(imageUrl => deleteFromCloudinary(imageUrl));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error deleting images from Cloudinary:', error);
        }
    }

    // Delete event from database
    await Event.findByIdAndDelete(id);

    res.status(204).json({
        status: "success",
        data: null
    });
});

module.exports = {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    deleteEvent
};

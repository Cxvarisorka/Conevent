const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Basic event information
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    // Reference to the organisation creating this event
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: [true, 'Event must belong to an organisation']
    },

    // Event category (type of event)
    category: {
        type: String,
        enum: ['workshop', 'seminar', 'conference', 'webinar', 'hackathon', 'career-fair', 'networking', 'competition', 'cultural', 'sports', 'other'],
        required: [true, 'Event category is required']
    },

    // Event images
    coverImage: {
        type: String,  // URL to cover image
        default: null
    },
    images: [{
        type: String  // Array of image URLs
    }],

    // Event format (online/offline/hybrid)
    eventType: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        required: [true, 'Event type is required']
    },

    // Meeting link for online/hybrid events
    onlineLink: {
        type: String,
        trim: true
    },

    // Location details for offline/hybrid events
    street: {
        type: String,  // Street address of the venue
        trim: true
    },
    address: {
        type: String,  // Full address or additional address details
        trim: true
    },
    city: {
        type: String,  // City where event is taking place
        trim: true
    },

    // Event schedule
    startDate: {
        type: Date,
        required: [true, 'Event start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'Event end date is required']
    },

    // Registration period
    registrationStartDate: {
        type: Date,
        default: Date.now  // Registration opens immediately by default
    },
    registrationEndDate: {
        type: Date,
        required: [true, 'Registration end date is required']
    },

    // Capacity management
    capacity: {
        type: Number,  // Maximum number of attendees
        required: [true, 'Event capacity is required'],
        min: [5, 'Capacity must be at least 5']
    },
    registeredCount: {
        type: Number,  // Current number of registered users
        default: 0
    },

    // Pricing information
    isFree: {
        type: Boolean,  // True if event is free
        default: true
    },
    price: {
        type: Number,  // Event ticket price
        default: 0,
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,  // Currency code (USD, EUR, etc.)
        default: 'USD'
    },

    // Search and categorization
    tags: [{
        type: String,  // Keywords for better discoverability
        trim: true
    }],

    // Event status workflow
    status: {
        type: String,
        enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
        default: 'draft'
    },

    // Additional information
    requirements: {
        type: String,  // Prerequisites or requirements to attend
        maxlength: [1000, 'Requirements cannot exceed 1000 characters']
    },

    // Contact information for event queries
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    contactPhone: {
        type: String,
        trim: true
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Index for text search on title, description, and tags
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for filtering events by category, type, and status
eventSchema.index({ category: 1, eventType: 1, status: 1 });

// Index for finding events by organisation
eventSchema.index({ organisationId: 1 });

// Index for date-based queries (upcoming events, past events, etc.)
eventSchema.index({ startDate: 1, endDate: 1 });

// Pre-save validation hook
eventSchema.pre('save', function(next) {
    // Ensure event end date is after start date
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }

    // Ensure registration closes before event starts
    if (this.registrationEndDate >= this.startDate) {
        return next(new Error('Registration must end before event starts'));
    }

    // Ensure registration end date is in the future (only for new events)
    if (this.isNew && new Date(this.registrationEndDate) < new Date()) {
        return next(new Error('Registration end date must be in the future'));
    }

    next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

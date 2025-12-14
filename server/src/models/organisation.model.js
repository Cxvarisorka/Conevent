const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organisation name is required'],
        trim: true,
        maxlength: [100, 'Organisation name cannot exceed 100 characters']
    },
    type: {
        type: String,
        enum: ['university', 'company', 'institution', 'other'],
        required: [true, 'Organisation type is required']
    },
    description: {
        type: String,
        required: [true, 'Organisation description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    logo: {
        type: String,
        default: null
    },
    coverImage: {
        type: String,
        default: null
    },
    website: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Organisation email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    socialMedia: {
        linkedin: String,
        facebook: String,
        twitter: String,
        instagram: String
    },
    // Users who can manage this organisation and create events
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Index for filtering by organisation type
organisationSchema.index({ type: 1 });

const Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;

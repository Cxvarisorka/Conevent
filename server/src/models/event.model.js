const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University ID is required'],
    validate: {
      validator: function(id) {
        return mongoose.Types.ObjectId.isValid(id);
      },
      message: 'Invalid university ID'
    }
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        return date instanceof Date && !isNaN(date);
      },
      message: 'Please provide a valid date'
    }
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters long'],
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  images: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(images) {
          return images.length <= 4;
        },
        message: 'Maximum 4 images allowed per event'
      },
      {
        validator: function(images) {
          return images.every(url => /^https?:\/\/.+/.test(url));
        },
        message: 'All image URLs must be valid'
      }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

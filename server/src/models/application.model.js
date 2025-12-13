const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
    validate: {
      validator: function(id) {
        return mongoose.Types.ObjectId.isValid(id);
      },
      message: 'Invalid event ID'
    }
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
    validate: {
      validator: function(id) {
        return mongoose.Types.ObjectId.isValid(id);
      },
      message: 'Invalid student ID'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected'],
      message: 'Status must be either pending, accepted, or rejected'
    },
    default: 'pending'
  }
}, {
  timestamps: true
});

applicationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

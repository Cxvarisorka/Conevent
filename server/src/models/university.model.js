const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const universitySchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  passwordHash: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  googleId: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    minlength: [2, 'University name must be at least 2 characters long'],
    maxlength: [200, 'University name cannot exceed 200 characters']
  },
  logo: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true;
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Logo must be a valid URL'
    }
  },
  bio: {
    type: String,
    default: '',
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

universitySchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

universitySchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

universitySchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('University', universitySchema);

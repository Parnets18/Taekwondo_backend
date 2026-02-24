const mongoose = require('mongoose');

const blackBeltSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  belt: {
    type: String,
    required: true,
    trim: true
  },
  yearsTraining: {
    type: String,
    required: true,
    trim: true
  },
  achievements: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
blackBeltSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BlackBelt', blackBeltSchema);

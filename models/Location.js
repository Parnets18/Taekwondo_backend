const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['location', 'school'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  timings: {
    days: {
      type: String,
      default: '',
      trim: true
    },
    time: {
      type: String,
      default: '',
      trim: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);

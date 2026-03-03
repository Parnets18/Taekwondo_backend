const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['instructor', 'student'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  eventName: {
    type: String,
    trim: true,
    default: null
  },
  medalType: {
    type: String,
    enum: ['Gold', 'Silver', 'Bronze', null],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);

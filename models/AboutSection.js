const mongoose = require('mongoose');

const aboutSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'About Combat Warrior Dojang'
  },
  description: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AboutSection', aboutSectionSchema);

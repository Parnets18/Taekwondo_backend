const mongoose = require('mongoose');

const aboutDojangStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Our Dojang Story'
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

module.exports = mongoose.model('AboutDojangStory', aboutDojangStorySchema);

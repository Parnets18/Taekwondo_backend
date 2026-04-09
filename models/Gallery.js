const mongoose = require('mongoose');

const CATEGORIES = ['Seminars', 'Stunts', 'Our Memories', 'Video', 'Competitions', 'Belt Ceremonies'];

const gallerySchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'Our Memories'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
